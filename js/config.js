/**
 * Configuration du site : c'est le SEUL fichier à modifier.
 * Remplacez les valeurs "VOTRE_..." en suivant le README.md.
 *
 * Ces clés sont PUBLIQUES par nature (elles se retrouvent dans le navigateur
 * des visiteurs). La sécurité vient des règles de la base (voir supabase/schema.sql) :
 * le public peut seulement ajouter une inscription, jamais lire les autres.
 */
export const CONFIG = {
  // Base de données Supabase (Project Settings > API)
  supabase: {
    url: "https://qdaahgjpotpfslogmhow.supabase.co",
    cle: "sb_publishable_ipdhk1kcB2Wxbhasp26uoQ_dU2-8mWI", // clé "anon" ou "publishable", jamais la clé "service_role"
    table: "inscriptions",
  },

  // Mail de confirmation avec EmailJS (https://www.emailjs.com)
  emailjs: {
    serviceId: "service_zwhnc2k",
    templateId: "template_valtfrl",
    clePublique: "IZIGIBBhQg7Q2NDKm",
  },

  // Informations de la Master Class (compte à rebours et mail de confirmation)
  masterclass: {
    debut: "2026-11-16",
    fin: "2026-11-27",
    lieu: "Home 8, Local 81 - Centre Bera",
    dates: "Du lundi 16 au vendredi 27 novembre 2026",
    montant: "20$",
    fraisInscription: "5000 fc",
    contact: "+243 860983465 / 981356302 / 963861302",
  },
};
