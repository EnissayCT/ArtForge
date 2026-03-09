import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente | ArtForge Studio",
  description:
    "Consultez les conditions générales de vente et d'utilisation d'ArtForge Studio.",
};

const sections = [
  {
    title: "Article 1 – Objet",
    content: `Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre ArtForge Studio (ci-après « le Vendeur ») et toute personne physique ou morale effectuant un achat sur le site artforge.ma (ci-après « le Client »). En passant commande, le Client accepte sans réserve les présentes CGV.`,
  },
  {
    title: "Article 2 – Produits et services",
    content: `ArtForge Studio propose la vente en ligne de produits personnalisés imprimés par technologie UV, notamment :
• Plaques décoratives en aluminium (formats A4 et A3, finitions mat et brillant)
• Coques de protection pour téléphones (iPhone et Samsung)

Les photographies et descriptions des produits sont fournies à titre indicatif. Le rendu final peut légèrement varier en fonction de l'écran de l'utilisateur et des caractéristiques du fichier source fourni.`,
  },
  {
    title: "Article 3 – Commandes",
    content: `Le Client passe commande via le site internet en suivant le processus de personnalisation et de validation du panier. La commande est considérée comme définitive après confirmation par le Client lors de l'étape de validation.

Étant donné la nature personnalisée des produits, chaque commande est fabriquée sur mesure. Le Vendeur se réserve le droit de refuser toute commande contenant des images à caractère illégal, diffamatoire, ou portant atteinte aux droits de tiers.`,
  },
  {
    title: "Article 4 – Prix",
    content: `Les prix sont indiqués en Dirhams Marocains (MAD), toutes taxes comprises (TTC). Le Vendeur se réserve le droit de modifier ses prix à tout moment, étant entendu que les produits seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.

Les frais de livraison sont indiqués avant la confirmation de la commande et varient en fonction de la zone de livraison.`,
  },
  {
    title: "Article 5 – Paiement",
    content: `Le paiement s'effectue à la livraison (Cash on Delivery – COD). Le Client règle le montant total de la commande (prix des produits + frais de livraison) au livreur au moment de la réception du colis.

Aucun paiement en ligne n'est requis au moment de la commande.`,
  },
  {
    title: "Article 6 – Livraison",
    content: `Les livraisons sont effectuées sur l'ensemble du territoire marocain. Les délais de livraison indicatifs sont :
• Production : 24 à 72 heures ouvrées
• Livraison : 2 à 5 jours ouvrés selon la zone géographique

Les délais sont donnés à titre indicatif et ne constituent pas un engagement contractuel. Le Vendeur ne saurait être tenu responsable des retards dus au transporteur ou à des circonstances indépendantes de sa volonté (jours fériés, intempéries, etc.).`,
  },
  {
    title: "Article 7 – Droit de rétractation et retours",
    content: `Conformément à la législation marocaine (loi 31-08 relative à la protection du consommateur), les produits personnalisés sur mesure ne bénéficient pas du droit de rétractation.

Toutefois, en cas de produit défectueux, endommagé lors du transport, ou non conforme à la commande (erreur de modèle, taille ou finition), le Client peut signaler le problème dans un délai de 48 heures suivant la réception. Après vérification, le Vendeur procédera au remplacement du produit à ses frais.`,
  },
  {
    title: "Article 8 – Propriété intellectuelle",
    content: `Le Client garantit qu'il dispose des droits nécessaires sur les images et contenus fournis pour la personnalisation de ses produits. Le Vendeur ne saurait être tenu responsable en cas d'utilisation d'images protégées par le droit d'auteur ou le droit à l'image.

Le contenu du site (textes, images, logos, éléments graphiques) est la propriété exclusive d'ArtForge Studio et est protégé par les lois relatives à la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation est interdite.`,
  },
  {
    title: "Article 9 – Protection des données personnelles",
    content: `Les données personnelles collectées lors de la commande (nom, adresse, téléphone) sont utilisées exclusivement pour le traitement et la livraison de la commande. Le Vendeur s'engage à ne pas transmettre ces données à des tiers, sauf obligation légale.

Conformément à la loi marocaine 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, le Client dispose d'un droit d'accès, de rectification et de suppression de ses données.`,
  },
  {
    title: "Article 10 – Limitation de responsabilité",
    content: `Le Vendeur ne saurait être tenu responsable :
• Des légères variations de couleur entre l'aperçu numérique et le produit imprimé
• De la qualité insuffisante d'une image fournie par le Client (résolution trop basse)
• Des dommages résultant d'une mauvaise utilisation du produit
• De l'indisponibilité temporaire du site pour maintenance ou raisons techniques`,
  },
  {
    title: "Article 11 – Réclamations et contact",
    content: `Pour toute question, réclamation ou demande relative à une commande, le Client peut contacter le service client ArtForge Studio par les moyens suivants.`,
  },
  {
    title: "Article 12 – Droit applicable",
    content: `Les présentes CGV sont soumises au droit marocain. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents de Casablanca seront seuls habilités à connaître du différend.`,
  },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Conditions Générales{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              de Vente
            </span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Dernière mise à jour : Janvier 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {sections.map((s, i) => (
              <article key={s.title} id={`article-${i + 1}`}>
                <h2 className="text-lg sm:text-xl font-bold mb-3 text-foreground">
                  {s.title}
                </h2>
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {s.content}
                </div>

                {/* Contact info under Article 11 */}
                {i === 10 && (
                  <div className="mt-4 bg-secondary/50 rounded-xl p-6 border border-border/50 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-accent" />
                      <span>contact@artforge.ma</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-accent" />
                      <span>+212 6 00 00 00 00</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>Casablanca, Maroc</span>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Back */}
          <div className="mt-16 pt-8 border-t border-border/50 flex justify-center">
            <Link href="/">
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
