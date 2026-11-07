/**
 * Communication avec les services externes :
 *  - Supabase : enregistre l'inscription dans la base de données
 *  - EmailJS  : envoie le mail de confirmation
 * Tout passe par fetch(), aucune bibliothèque à installer.
 */
import { CONFIG } from "./config.js";

/** Erreur avec un code lisible par le reste de l'application. */
export class ErreurInscription extends Error {
  /**
   * @param {"config"|"reseau"|"doublon"|"serveur"} code
   * @param {string} message message prêt à être affiché au visiteur
   */
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function estConfigure(valeur) {
  return Boolean(valeur) && !valeur.includes("VOTRE_");
}

/**
 * Enregistre une inscription dans la table Supabase.
 * @param {object} donnees prenom, nom, email, telephone, connait_web, technologies, niveau
 * @throws {ErreurInscription}
 */
export async function enregistrerInscription(donnees) {
  const { url, cle, table } = CONFIG.supabase;

  if (!estConfigure(url) || !estConfigure(cle)) {
    throw new ErreurInscription(
      "config",
      "Le formulaire n'est pas encore relié à la base de données (voir js/config.js)."
    );
  }

  const entetes = {
    "Content-Type": "application/json",
    apikey: cle,
    Prefer: "return=minimal", // on n'a pas besoin de relire la ligne créée
  };
  // Les anciennes clés "anon" sont des JWT et vont aussi dans Authorization.
  // Les nouvelles clés "sb_publishable_..." n'en ont pas besoin.
  if (cle.startsWith("eyJ")) entetes.Authorization = `Bearer ${cle}`;

  let reponse;
  try {
    reponse = await fetch(`${url}/rest/v1/${table}`, {
      method: "POST",
      headers: entetes,
      body: JSON.stringify(donnees),
    });
  } catch {
    throw new ErreurInscription(
      "reseau",
      "Connexion impossible. Vérifiez votre accès internet puis réessayez."
    );
  }

  if (reponse.ok) return;

  // 409 = l'adresse mail existe déjà (index unique dans la base)
  if (reponse.status === 409) {
    throw new ErreurInscription("doublon", "Cette adresse mail est déjà inscrite.");
  }

  throw new ErreurInscription(
    "serveur",
    "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant."
  );
}

/**
 * Envoie le mail de confirmation via EmailJS.
 * Ne lève jamais d'erreur : l'inscription est déjà enregistrée, le mail est un plus.
 * @returns {Promise<boolean>} true si le mail est parti
 */
export async function envoyerMailConfirmation(donnees) {
  const { serviceId, templateId, clePublique } = CONFIG.emailjs;
  const { masterclass } = CONFIG;

  if (![serviceId, templateId, clePublique].every(estConfigure)) return false;

  try {
    const reponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: clePublique,
        // Ces noms doivent correspondre aux {{variables}} du modèle EmailJS
        template_params: {
          prenom: donnees.prenom,
          nom: donnees.nom,
          email: donnees.email,
          telephone: donnees.telephone,
          lieu: masterclass.lieu,
          dates: masterclass.dates,
          montant: masterclass.montant,
          frais_inscription: masterclass.fraisInscription,
          contact: masterclass.contact,
        },
      }),
    });
    return reponse.ok;
  } catch {
    return false;
  }
}
