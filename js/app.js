/**
 * Point d'entrée de la page : relie le formulaire à la validation et aux services.
 */
import { CONFIG } from "./config.js";
import { validerChamp, normaliserTelephone } from "./validation.js";
import { enregistrerInscription, envoyerMailConfirmation } from "./api.js";
import { demarrerCompteARebours } from "./countdown.js";

/* ---------- Éléments de la page ---------- */
const formulaire = document.querySelector("#form-inscription");
const blocSucces = document.querySelector("#succes");
const suiteQuestionnaire = document.querySelector("#suite-questionnaire");
const barre = document.querySelector("#progression-barre");
const texteProgression = document.querySelector("#progression-texte");
const bouton = document.querySelector("#bouton-envoi");
const statut = document.querySelector("#statut");

const CHAMPS_TEXTE = ["prenom", "nom", "email", "telephone"];
const champsTouches = new Set(); // champs que la personne a déjà quittés

/* ---------- Lecture du formulaire ---------- */
const valeurDe = (nom) => formulaire.elements[nom].value;
const suiteOuverte = () => ["notions", "pratique"].includes(valeurDe("connait_web"));

/** Liste des champs obligatoires à vérifier en ce moment. */
function champsObligatoires() {
  const champs = [...CHAMPS_TEXTE, "connait_web"];
  if (suiteOuverte()) champs.push("niveau");
  return champs;
}

/* ---------- Affichage des erreurs ---------- */
function afficherErreur(nom, message) {
  const zone = document.querySelector(`#erreur-${nom}`);
  zone.textContent = message;

  const champ = formulaire.elements[nom];
  if (champ instanceof HTMLInputElement) {
    champ.setAttribute("aria-invalid", message ? "true" : "false");
  }
}

/** Vérifie un champ, affiche l'erreur éventuelle et renvoie true si valide. */
function verifierChamp(nom) {
  const message = validerChamp(nom, valeurDe(nom));
  afficherErreur(nom, message);
  return message === "";
}

/* ---------- Barre de progression ---------- */
function mettreAJourProgression() {
  const obligatoires = champsObligatoires();
  const faits = obligatoires.filter((nom) => validerChamp(nom, valeurDe(nom)) === "").length;

  barre.style.width = `${(faits / obligatoires.length) * 100}%`;
  texteProgression.textContent =
    faits === obligatoires.length
      ? "Tout est prêt, vous pouvez confirmer."
      : `${faits} réponse${faits > 1 ? "s" : ""} sur ${obligatoires.length}`;
}

/* ---------- Questionnaire : ouverture de la suite ---------- */
function mettreAJourSuite() {
  const ouvert = suiteOuverte();
  suiteQuestionnaire.dataset.ouvert = String(ouvert);
  suiteQuestionnaire.inert = !ouvert; // empêche le clavier d'entrer dans la zone fermée

  if (!ouvert) {
    // Si la personne revient sur « Non, je pars de zéro », on efface les réponses de la suite
    formulaire
      .querySelectorAll('input[name="technologies"], input[name="niveau"]')
      .forEach((case_) => { case_.checked = false; });
    afficherErreur("niveau", "");
  }
}

/* ---------- Événements sur les champs ---------- */
CHAMPS_TEXTE.forEach((nom) => {
  const champ = formulaire.elements[nom];

  champ.addEventListener("blur", () => {
    champsTouches.add(nom);
    verifierChamp(nom);
  });

  champ.addEventListener("input", () => {
    if (champsTouches.has(nom)) verifierChamp(nom);
    mettreAJourProgression();
  });
});

formulaire.elements.connait_web.forEach((radio) => {
  radio.addEventListener("change", () => {
    afficherErreur("connait_web", "");
    mettreAJourSuite();
    mettreAJourProgression();
  });
});

formulaire.elements.niveau.forEach((radio) => {
  radio.addEventListener("change", () => {
    afficherErreur("niveau", "");
    mettreAJourProgression();
  });
});

/* ---------- Envoi ---------- */
function afficherStatut(message, type = "") {
  statut.textContent = message;
  statut.className = type ? `statut statut--${type}` : "statut";
}

function basculerChargement(enCours) {
  bouton.disabled = enCours;
  bouton.classList.toggle("est-en-cours", enCours);
  bouton.querySelector(".bouton-texte").textContent = enCours
    ? "Enregistrement…"
    : "Confirmer mon inscription";
}

/** Vérifie tous les champs obligatoires. Renvoie le nom du premier champ en erreur, ou null. */
function premiereErreur() {
  let premier = null;
  champsObligatoires().forEach((nom) => {
    if (!verifierChamp(nom) && premier === null) premier = nom;
  });
  return premier;
}

function collecterDonnees() {
  const connaitWeb = valeurDe("connait_web");

  return {
    prenom: valeurDe("prenom").trim(),
    nom: valeurDe("nom").trim(),
    email: valeurDe("email").trim().toLowerCase(),
    telephone: normaliserTelephone(valeurDe("telephone")),
    connait_web: connaitWeb,
    technologies: suiteOuverte()
      ? [...formulaire.querySelectorAll('input[name="technologies"]:checked')].map((c) => c.value)
      : [],
    niveau: suiteOuverte() ? valeurDe("niveau") : null,
  };
}

function afficherSucces(donnees, mailEnvoye) {
  document.querySelector("#succes-message").textContent =
    `Merci ${donnees.prenom}, votre place est réservée pour la Master Class.`;

  document.querySelector("#succes-mail").textContent = mailEnvoye
    ? `Un mail de confirmation a été envoyé à ${donnees.email}. Pensez à regarder dans vos courriers indésirables.`
    : "Le mail de confirmation n'a pas pu être envoyé, mais votre inscription est bien enregistrée. En cas de doute, appelez-nous.";

  formulaire.hidden = true;
  blocSucces.hidden = false;
  blocSucces.focus();
  blocSucces.scrollIntoView({ behavior: "smooth", block: "start" });
}

formulaire.addEventListener("submit", async (evenement) => {
  evenement.preventDefault();
  afficherStatut("");

  // Un robot remplit le champ caché : on ignore sans rien dire
  if (valeurDe("site_web")) return;

  const champEnErreur = premiereErreur();
  if (champEnErreur) {
    afficherStatut("Corrigez les champs indiqués en rouge.", "erreur");
    const cible = formulaire.elements[champEnErreur];
    (cible.length ? cible[0] : cible).focus(); // un groupe de cases renvoie une liste
    return;
  }

  const donnees = collecterDonnees();
  basculerChargement(true);

  try {
    await enregistrerInscription(donnees);
  } catch (erreur) {
    basculerChargement(false);
    afficherStatut(erreur.message, "erreur");
    if (erreur.code === "doublon") {
      afficherErreur("email", erreur.message);
      formulaire.elements.email.focus();
    }
    return;
  }

  const mailEnvoye = await envoyerMailConfirmation(donnees);
  afficherSucces(donnees, mailEnvoye);
});

/* ---------- Démarrage ---------- */
demarrerCompteARebours(
  document.querySelector("#compte-a-rebours"),
  CONFIG.masterclass.debut,
  CONFIG.masterclass.fin
);
mettreAJourSuite();
mettreAJourProgression();
