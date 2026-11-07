/**
 * Règles de validation du formulaire.
 * Chaque règle renvoie "" si la valeur est correcte, sinon le message d'erreur à afficher.
 */

/**
 * Met un numéro au format international (+243...).
 * Accepte : "+243 860 983 465", "0860983465", "860983465", "00243860983465".
 * Les numéros d'un autre pays doivent commencer par "+".
 * @param {string} saisie
 * @returns {string|null} le numéro normalisé, ou null s'il est invalide
 */
export function normaliserTelephone(saisie) {
  let numero = saisie.replace(/[\s.\-()]/g, "");

  if (numero.startsWith("+") && !numero.startsWith("+243")) {
    return /^\+\d{8,15}$/.test(numero) ? numero : null;
  }

  if (numero.startsWith("+243")) numero = numero.slice(4);
  else if (numero.startsWith("00243")) numero = numero.slice(5);
  else if (numero.startsWith("243") && numero.length === 12) numero = numero.slice(3);
  else if (numero.startsWith("0")) numero = numero.slice(1);

  // Un numéro congolais compte 9 chiffres après l'indicatif
  return /^[1-9]\d{8}$/.test(numero) ? `+243${numero}` : null;
}

const REGLES = {
  prenom: (valeur) =>
    valeur.trim().length >= 2 ? "" : "Entrez votre prénom (2 lettres minimum).",

  nom: (valeur) =>
    valeur.trim().length >= 2 ? "" : "Entrez votre nom (2 lettres minimum).",

  email: (valeur) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur.trim())
      ? ""
      : "Entrez une adresse mail valide, par exemple nom@gmail.com.",

  telephone: (valeur) =>
    normaliserTelephone(valeur)
      ? ""
      : "Entrez un numéro valide, par exemple +243 812 345 678.",

  connait_web: (valeur) =>
    valeur ? "" : "Choisissez une réponse.",

  niveau: (valeur) =>
    valeur ? "" : "Choisissez votre niveau.",
};

/**
 * @param {string} nom     nom du champ (prenom, nom, email, telephone, connait_web, niveau)
 * @param {string} valeur  valeur saisie
 * @returns {string} message d'erreur, ou "" si tout va bien
 */
export function validerChamp(nom, valeur) {
  const regle = REGLES[nom];
  return regle ? regle(valeur) : "";
}
