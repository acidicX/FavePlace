import React from 'react';
import './About.css';

export default function About() {
    return (
        <div className="about" >
            <h1 className="heading">FavePlace</h1>
            <div className="content">
                <p>
                    <span>Diese App ist im Rahmen des Hackathons </span>
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
                <h1>Impressum</h1>
                <p>
                    <span>FavePlace ist eine Open Source Software: </span>
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://github.com/acidicX/FavePlace">
                        https://github.com/acidicX/FavePlace
                    </a>
                </p>
                <h3>Copyright / Urheberrecht und Nutzungsrecht</h3>
                <p>
                    Mit dem Hochladen der Bilder auf die Plattform gewähren sie dem Betreiber ein Nutzungsrecht für diese Bilder wie folgt:
                </p>
                <ul>
                    <li>einfach</li>
                    <li>zeitlich unbeschränkt</li>
                    <li>räumlich unbeschränkt</li>
                </ul>
                <p>
                    Die Übertragung und Einräumung weiterer Nutzungsrechte auf beziehungsweise für Dritte durch den Betreiber erfolgt nicht. Die  Weitergabe an Pressevertreter für eine redaktionelle Verwendung ist mit  Angabe des Urhebers (sofern verfügbar) zulässig.
                </p>
                <h3>Technischer Betrieb dieser Instanz</h3>
                <p>
                    unterstützt von: <br></br><br></br>

                    <span>
                        Peerigon GmbH<br></br>
                        Werner-von-Siemens-Str. 6<br></br>
                        86159 Augsburg<br></br>
                    </span>
                </p>
                <p>
                    <span>Es gilt das </span>
                    <a target="_blank" rel="noopener noreferrer" href="https://peerigon.com/de/kontakt">
                        Impressum der Peerigon GmbH
                        </a>
                    <span>.<br></br></span>
                    <span>Es gilt die </span>
                    <a target="_blank" rel="noopener noreferrer" href="https://peerigon.com/de/datenschutz">Datenschutzerklärung der Peerigon GmbH</a>
                    <span>.</span>
                </p>
            </div>
        </div>
  );
}
