import React from "react";
import styled from "styled-components";
import {TagButton, ColoredBackgroundSlot, PlainSlotMono} from "../TagButton";

const ExampleSlotWrapper = styled.div`
  margin-left: 20px;
`;

const InstructionsWrapper = styled.div`
  color: var(--grey);
  font-size: 0.875rem;
  position: relative;
  height: 100%;
  overflow-y: auto;
  background: white;

  > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    padding: 0 1.25rem 1rem;
  }
`;

const InstructionsList = styled.ul`
  margin: 1rem 0;
  padding: 0 0 0 1rem;

  li {
    margin-top: 0.5rem;
  }
`;

export function UsageInstructions({language}) {
  return (
    <InstructionsWrapper data-testid="usage-instructions">
      {language !== "fi" ? (
        <div>
          <h3>Usage instructions</h3>
          <p>
            Transitlog analyzes both real-time and archived public transport journeys and
            their related events, and compares them to what was planned.
          </p>
          <InstructionsList>
            <li>
              To reset the app and get back to this screen, click the "reset" button
              above.
            </li>
            <li>
              To update the currently fetched data and set the time to the current time,
              click "update" above.
            </li>
            <li>
              The large toolbar at the top of the app is used to select what data you want
              to view. The first section handles date and time settings, the second
              handles line and route selection, the third handles vehicle search and
              filtering and the last handles stop search and filtering.
            </li>
            <li>
              The slider at the bottom of the filter bar can be used to change the time.
              When a journey is selected, the slider range will be defined by the start
              and end of the events collection.
            </li>
            <li>
              To view all journeys of a route, first select a line and then select a route
              in the selection menu that appeared. This sidebar will get populated with a
              list of the route's journeys through the currently selected date.
            </li>
            <li>
              Click a journey in the list to fetch the HFP (High-Frequency Positions)
              events related to that journey. The exact route that the vehicle took will
              be drawn on the map, and a marker representing the position of the vehicle
              at the selected time will also appear.
            </li>
            <li>
              Green, red and yellow colors across the app represent how well an event
              matched with what was planned. For example, the colored boxes that appeared
              in the Journey list tells us how late (yellow) or early (red) or on-time
              (green) the vehicle began its journey. Usually the data contained in the
              colored box is the difference between the planned and the observed times.
              Examples below.
            </li>
            <ExampleSlotWrapper>
              <li>
                <TagButton style={{marginTop: "0.5rem", marginBottom: "1rem"}}>
                  <PlainSlotMono>18:00:00</PlainSlotMono>
                  <ColoredBackgroundSlot
                    color="white"
                    backgroundColor="var(--light-green)">
                    00:25
                  </ColoredBackgroundSlot>
                  <PlainSlotMono>18:00:25</PlainSlotMono>
                </TagButton>
                The vehicle departured less than 3 minutes after the scheduled departure
                time so it is on time.
              </li>
              <li>
                <TagButton style={{marginTop: "0.5rem", marginBottom: "1rem"}}>
                  <PlainSlotMono>18:00:00</PlainSlotMono>
                  <ColoredBackgroundSlot
                    color="white"
                    backgroundColor="var(--dark-yellow)">
                    03:04
                  </ColoredBackgroundSlot>
                  <PlainSlotMono>18:03:04</PlainSlotMono>
                </TagButton>
                The vehicle departured more than 3 minutes after the scheduled departure
                time so it is late.
              </li>
              <li>
                <TagButton style={{marginTop: "0.5rem", marginBottom: "1rem"}}>
                  <PlainSlotMono>18:00:00</PlainSlotMono>
                  <ColoredBackgroundSlot color="white" backgroundColor="var(--red)">
                    -00:30
                  </ColoredBackgroundSlot>
                  <PlainSlotMono>17:59:30</PlainSlotMono>
                </TagButton>
                The vehicle departured more than 10 seconds before the scheduled departure
                so it is early.
              </li>
            </ExampleSlotWrapper>
            <li>
              There are some exceptions to this though. The last stop of the journey has a
              so called recovery time. Because of this the vehicle can arrive to the last
              stop more than few minutes (or whatever the recovery time for that
              particular journey is) late and still be considered on time. The vehicle is
              also considered to be on time at the starting stop if the vehicle arrives
              before the planned departure. If the vehicle arrives to the starting stop
              after the planned departure it is considered late and marked with red.
            </li>
            <li>
              To view the timetables for a stop, either select a stop from the map (you
              need to be zoomed in a bit to see them) or use the Stop filter input to
              choose a stop by writing its stop ID, short ID or name.
            </li>
            <li>
              Zoom in until you see a button with a square icon in the bottom right of the
              map. Click this icon and draw a box around an area to fetch all HFP events
              that happened inside that area. They will be drawn on the map and displayed
              as a list in the sidepanel.
            </li>
            <li>
              Scroll in the Time settings section of the Filter bar to reveal additional
              time settings. Use the "area search range" setting to control the range of
              minutes that area searches should use. For example, a value of 60 searches
              for HFP events that happened 30 minutes before and 30 minutes after the
              currently selected time.
            </li>
            <li>
              Use the "live" toggle to start automatically updating the clock every
              second, adding the number of seconds set in the "time increment" field. If
              the current time is current (no more than 5 minutes after the current
              real-world time), the whole app will auto-update and fetch new data every
              second, enabling you to view events as they happen.
            </li>
          </InstructionsList>
        </div>
      ) : (
        <div>
          <h3>Käyttöohjeet</h3>
          <p>
            Reittiloki näyttää selainpohjaisessa karttaohjelmassa joukkoliikenteen
            ajetuista lähdöistä historia- ja reaaliaikaista tietoa sekä vertaa
            toteutunutta liikennettä aikataulun mukaisiin lähtöihin.
          </p>
          <InstructionsList>
            <li>
              <strong>Jaa näkymä</strong>: voit kopioida näkymän linkin ja esimerkiksi
              lähettää sen sähköpostilla.
            </li>
            <li>
              <strong>Uusi haku</strong>: nollaa hakuvalinnat, voit tehdä uuden haun.
            </li>
            <li>
              <strong>Päivitä</strong>: tuo ohjelmaan viimeisimmät tiedot ja päivittää
              kellonajan tähän hetkeen.
            </li>
            <li>
              <strong>Valitse päivä ja aika</strong>: valitse päivämäärä ja kellonaika eli
              ajankohta, jolta haet lähtöjä. Päivämäärä pitää aina olla valittuna.
            </li>
            <li>
              <strong>Hae reitti</strong>: kirjoita sen reitin tai linjan numero, jonka
              lähtöjä haet.
            </li>
            <li>
              <strong>Hae ajoneuvoja</strong>: kirjoita rekisterinumero, kylkinumero tai
              liikennöitsijän nimi.
            </li>
            <li>
              <strong>Hae pysäkkiä</strong>: kirjoita pysäkin numero, tunniste tai nimi.
            </li>
            <li>
              Kun olet täyttänyt hakukriteerit, vasempaan ikkunaan avautuu listaus valitun
              reitin lähdöistä tai lähtöketjun eli kyseisen kulkuneuvon lähdöistä ko.
              päivältä tai aikataululistaus kaikista linjoista, jotka käyttävät valittua
              pysäkkiä.
            </li>
            <li>
              Voit hakea lähtöjä myös rajaamalla alueen kartalta. Klikkaa kartan oikeassa
              alakulmassa olevaa työkalua ja rajaa haluamasi alue kartalta. Näet kaikki
              lähdöt, jotka ovat kulkeneet rajatulla alueella päivä- ja aika-kentissä
              valittuna olevana aikana. Voit rajata aikaväliä aluehaun minuuttirajauksella
              päivämäärä-asetuksissa.
            </li>
            <li>
              Kun valitset lähdön listasta, saat siitä tarkemmat tiedot palkin viereen
              avautuvaan uuteen ikkunaan. Lähdöstä kerrotaan pysäkkikohtaisesti
              suunniteltu ja toteutunut lähtöaika sekä niiden erotus, joka on korostettu
              värein. Värit kertovat, onko auto ohittanut pysäkin ajallaan, etuajassa vai
              myöhässä. Vihreä merkitsee ajallaan (0- +3 min), punainen etuajassa ja
              keltainen myöhässä (yli 3 min). Myös saapumisen kellonaika on kerrottu
              pysäkkikohtaisesti. Alla esimerkkejä tilanteista.
            </li>
            <ExampleSlotWrapper>
              <li>
                <TagButton style={{marginTop: "0.5rem", marginBottom: "1rem"}}>
                  <PlainSlotMono>18:00:00</PlainSlotMono>
                  <ColoredBackgroundSlot
                    color="white"
                    backgroundColor="var(--light-green)">
                    00:25
                  </ColoredBackgroundSlot>
                  <PlainSlotMono>18:00:25</PlainSlotMono>
                </TagButton>
                <p>
                  {" "}
                  Lähtö on tapahtunut alle 3 minuuttia suunnitellun lähdön jälkeen eli
                  lähtö on ajoissa.
                </p>
              </li>
              <li>
                <TagButton style={{marginTop: "0.5rem", marginBottom: "1rem"}}>
                  <PlainSlotMono>18:00:00</PlainSlotMono>
                  <ColoredBackgroundSlot
                    color="white"
                    backgroundColor="var(--dark-yellow)">
                    03:04
                  </ColoredBackgroundSlot>
                  <PlainSlotMono>18:03:04</PlainSlotMono>
                </TagButton>
                <p>
                  {" "}
                  Lähtö on tapahtunut yli 3 minuuttia suunnitellun lähdön jälkeen eli
                  lähtö on myöhässä.
                </p>
              </li>
              <li>
                <TagButton style={{marginTop: "0.5rem", marginBottom: "1rem"}}>
                  <PlainSlotMono>18:00:00</PlainSlotMono>
                  <ColoredBackgroundSlot color="white" backgroundColor="var(--red)">
                    -00:30
                  </ColoredBackgroundSlot>
                  <PlainSlotMono>17:59:30</PlainSlotMono>
                </TagButton>
                Lähtö on tapahtunut 10 sekuntia ennen suunniteltua lähtöä eli lähtö on
                etuajassa.
              </li>
            </ExampleSlotWrapper>

            <li>
              Värikoodituksessa reitin alku- ja loppupysäkit ovat kuitenkin
              poikkeuksellisia. Loppupysäkillä on elpymisaika. Tämän takia ajoneuvo voi
              olla viimeiseltä pysäkiltä elpymisajan verran myöhässä, mutta kuitenkin
              ajoissa. Alkupysäkillä värikoodina on vihreä jos ajoneuvo on saapunut
              pysäkille ennen suuniteltua lähtöaikaa. Jos ajoneuvo saapuu alkupysäkille
              suunnitellun lähtöajan jälkeen värikoodi on aina punainen.
            </li>

            <li>
              Kartalla myös pysäkit ja reittiviiva on korostettu värein. Väri kertoo,
              miten auto on kulkenut aikatauluun nähden. Värien merkitykset ovat samat
              kuin edellisessä kohdassa. Väliaikapysäkit on korostettu sisältä keltaisella
              tai punaisella, jos väliaikapysäkin lähtöaikaa ei ole noudatettu. Pysäkin
              merkkiväri on merkitty katkoviivalla, jos ovet eivät ole avautuneet
              pysäkillä. Lisäksi bussin viereen tulee sininen pieni ympyrä, kun ovet ovat
              avoinna.
            </li>
            <li>Infoikkunan saa piilotettua sivupalkin oikealta reunalta kuvakkeesta.</li>
            <li>
              Ylähakupalkin alareunassa on liukusäädin, jossa näkyy kellonaika. Säädintä
              liikuttamalla voit muuttaa aikavalintaa. Kun tietty lähtö on valittuna, voit
              tarkastella liukusäätimellä ko. lähdön tapahtumia.
            </li>
            <li>
              Aikasimulointi- tai live-napilla voit toistaa valitsemasi lähdön tapahtumat
              kartalle haluamallasi nopeudella. Nopeutta voi muokata päivämäärä-ikkunassa
              aikamuutos kohdassa.
            </li>
            <li>
              Matkustajalaskennan täyttöasteen määritelmä: Kapasiteetti lasketaan auton
              rekisteröintikapasiteetista enimmäismäärän mukaan, eli istuma- ja
              seisomapaikat ilman lastenvaunujen vähennystä.
            </li>
          </InstructionsList>
        </div>
      )}
    </InstructionsWrapper>
  );
}
