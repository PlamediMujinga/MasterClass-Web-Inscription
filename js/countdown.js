/**
 * Compte à rebours affiché sous les dates.
 * Avant : « Début dans 9 jours ». Pendant : « Master Class en cours ». Après : « Master Class terminée ».
 */

/** Transforme "2026-11-16" en date locale à minuit. */
function lireDate(texte) {
  const [annee, mois, jour] = texte.split("-").map(Number);
  return new Date(annee, mois - 1, jour);
}

function texteCompteARebours(debut, fin, maintenant) {
  // La fin est incluse : on compte jusqu'à minuit le lendemain du dernier jour
  const finDuDernierJour = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() + 1);

  if (maintenant >= finDuDernierJour) return "Master Class terminée";
  if (maintenant >= debut) return "Master Class en cours";

  const jours = Math.ceil((debut - maintenant) / 86_400_000);
  return jours === 1 ? "Début demain" : `Début dans ${jours} jours`;
}

/**
 * @param {HTMLElement} element  où écrire le texte
 * @param {string} dateDebut     "AAAA-MM-JJ"
 * @param {string} dateFin       "AAAA-MM-JJ"
 */
export function demarrerCompteARebours(element, dateDebut, dateFin) {
  const debut = lireDate(dateDebut);
  const fin = lireDate(dateFin);

  const afficher = () => {
    element.textContent = texteCompteARebours(debut, fin, new Date());
  };

  afficher();
  setInterval(afficher, 60 * 60 * 1000); // mise à jour toutes les heures
}
