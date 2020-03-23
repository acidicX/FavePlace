import fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv-safe';
const argv = require('yargs').argv
import semverRegex from 'semver-regex';
import semverDiff from 'semver-diff';
import conventionalGithubReleaser from 'conventional-github-releaser';
import rootPackageJson from './package.json';
import backendPackageJson from './backend/package.json';
import clientPackageJson from './client/package.json';
dotenv.config()

const ready = (err) => {
    if (err) {
        console.log(err)
        return
    }
    console.log(`new release ${argv.v} generated`)
}

const AUTH = {
    token: process.env.GITHUB_RELEASE_TOKEN,
    url: 'https://api.github.com'
};

if (semverRegex().test(argv.v) && semverDiff(rootPackageJson.version, argv.v)) {
    console.log('start generating a new release')
    console.log('bumping the package version with given input')

    rootPackageJson.version = argv.v

    fs.writeFileSync('./package.json', JSON.stringify(rootPackageJson, null, 2) + '\n');

    execSync(`npm i --loglevel=error`)

    backendPackageJson.version = argv.v

    fs.writeFileSync('./backend/package.json', JSON.stringify(backendPackageJson, null, 2) + '\n');

    execSync(`cd backend && npm i --loglevel=error && cd ../`)

    clientPackageJson.version = argv.v

    fs.writeFileSync('./client/package.json', JSON.stringify(clientPackageJson, null, 2) + '\n');

    execSync(`cd client && npm i --loglevel=error && cd ../`)

    execSync('git add .')

    execSync('git commit -m "bump version"')

    execSync(`git push origin master`)

    console.log('create a release tag with given input')

    execSync(`git tag ${argv.v}`)

    execSync(`git push origin ${argv.v}`)

    console.log('generate the release output')

    conventionalGithubReleaser(AUTH, {
        preset: 'angular'
    }, ready);
} else {
    console.log('specified tag is not valid or lower or equal then the current one')
    const numbers = rootPackageJson.version.split('.').map(n => parseInt(n))
    const patch = `${numbers[0]}.${numbers[1]}.${numbers[2] + 1}`
    const minor = `${numbers[0]}.${numbers[1] + 1}.0`
    const major = `${numbers[0] + 1}.0.0`

    console.log(`${patch} for patch`)
    console.log(`${minor} for minor`)
    console.log(`${major} for major`)
}
