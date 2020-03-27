import React from 'react';
import './HowTo.css';

export default function HowTo() {
  return (
    <div className="howto">
      <div className="center">
        <h1 className="heading">Anleitung</h1>
        <div className="content">
          <h3>Wie kann ich die Fotos oder Videos anschauen?</h3>
          <p>
            Benutze die Suche oder zoome so lange in die Karte hinein, bis du keine Cluster mehr
            siehst (Zahlen in den Kreisen) - sondern nur noch einzelne Punkte. Dann tippe/klicke auf
            einen der Punkte, um das Foto oder Video anzuzeigen.
          </p>
          <h3>Wie kann ich einen Ort, welchen ich sehen möchte, auf der Karte markieren?</h3>
          <p>
            Zoome so lange in die Karte hinein, bis die unten eine orange Leiste erscheint. Nun
            tippe/klicke auf den exakten Ort, den du markieren möchtest, und wähle danach die Option
            "Ich möchte hier hinreisen".
          </p>
          <h3>Wie kann ich ein Foto oder Video von einem Ort hochladen?</h3>
          <p>
            Sofern du direkt vor Ort bist, kannst du die Ortungsfunktion der App nutzen
            (tippe/klicke auf den Fadenkreuz-Button).
          </p>
          <p>
            Ansonsten zoome so lange in die Karte hinein, bis die unten eine orange Leiste
            erscheint. Nun tippe/klicke auf den exakten Ort, an dem du das Foto oder Video
            aufgenommen hast, und wähle danach die Option "Ich möchte einen neuen Ort teilen".
          </p>
        </div>
      </div>
    </div>
  );
}
