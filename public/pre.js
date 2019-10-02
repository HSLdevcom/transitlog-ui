/* eslint-disable */

(function() {
  var allowedEngines = ["webkit", "gecko"];
  var engine = window.Sniff.browser.engine;

  if (allowedEngines.indexOf(engine) === -1) {
    window.alert(
      `Selaimesi ei ole tuettu. Käytä Reittilokia Chromen tai Firefoxin kanssa.\n
Din webbläsare stöds inte av Rettiloki. Använd Chrome eller Firefox.\n
Your browser is not supported. Please use Reittiloki with Chrome or Firefox.`
    );
  }
})();
