import React from 'react';
import './About.css';

export default function About() {
    return (
        <div className="about" >
            <h1 className="heading">FavePlace</h1>
            <div className="content">
                <p>
                    <span>Diese App ist im Rahmen des Heckathons </span>
                    <a target="_blank" rel="noopener noreferrer" href="https://wirvsvirushackathon.org/">#wirwvsvirushack</a>
                    <span> der Bundesregierung entstanden. Auf </span>
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://devpost.com/software/favorite-place-taxi">
                        DevPost
                    </a>
                    <span> gibt es detaillierte Informationen zum Projekt.</span>
                </p>

                <h3>Das Problem, das wir lösen wollen</h3>
                <p>Aufgrund von Covid-19 und der erhöhten Ansteckungsgefahr wird es auf unabsehbare Zeit nicht mehr möglich sein, die eigenen Liebslingsorte zu besuchen, Ausflüge zu machen oder in den Urlaub zu fahren. Die fehlende Abwechslung führt bei vielen zu Frust und Unausgeglichenheit.</p>
                <h3>Die Grundidee hinter der Lösung</h3>
                <p>
                    Jeder Mensch lebt an einem anderen Ort und hat je nach Ausmaß der Ausgangsbeschränkung einen unterschiedlichen Bewegungsradius. Das nutzen wir: So können wir 360° Panoramen von den unterschiedlichsten Orten in unserer community-basierten WebApp sammeln und wieder zur Verfügung stellen - ganz ohne die Ausgangsbeschränkungen zu verletzen und ohne Ansteckungen zu riskieren.
                </p>
            </div>
        </div>

    )
}
