# Audit de surface — https://embrun.store/ — 2026-11-22T01:02:00Z

Outil surface_audit.py v1.0, 2026-11-22T01:02:00Z. Chaque valeur cite sa clé `evidence.json` ; le rapport ne reprend que des mesures de cette exécution.

## Résumé mesuré

| mesure | valeur |
|---|---|
| url_demandee | `https://embrun.store/` |
| url_finale | `https://embrun.store/` |
| requete.statut | `200` |
| requete.duree_ms | `205.4` |
| requete.taille_octets | `8373` |
| hash_corps | `a10a5f7b6ee6f56ddee1535883ac1775cb68303b9b892ee09e1cb6810548a75c` |
| requete.tronque | `false` |
| requete.redirections | `0` |

## En-têtes

| clé `en_tetes` | en-tête | valeur (tronquée à 200 caractères) |
|---|---|---|
| en_tetes.content_type | content-type | `text/html; charset=utf-8` |
| en_tetes.server | server | `cloudflare` |
| en_tetes.cache-control | cache-control | `max-age=600` |
| en_tetes.strict-transport-security | strict-transport-security | `null` |
| en_tetes.content-security-policy | content-security-policy | `null` |
| en_tetes.x-frame-options | x-frame-options | `null` |
| en_tetes.referrer-policy | referrer-policy | `null` |
| en_tetes.permissions-policy | permissions-policy | `null` |

## Structure HTML

| mesure | valeur |
|---|---|
| contenu_analyse.decodage | `utf-8` |
| html.balise_html_presente | `true` |
| html.entete_present | `true` |
| html.lang_present | `true` |
| html.lang | `fr` |
| html.lang_valeur_vide | `false` |
| html.title_present | `true` |
| html.title_longueur | `55` |
| html.title_texte | `Examen civique 2026 : les 259 questions en audio — 19 €` |
| html.meta_description_presente | `true` |
| html.meta_description_longueur | `189` |
| html.h1 | `1` |
| html.h2 | `4` |
| html.h3 | `0` |
| html.premier_titre | `h1` |
| html.h2_avant_h1 | `false` |
| html.images | `0` |
| html.images_sans_attribut_alt | `0` |
| html.liens_a_href | `17` |
| html.liens_internes | `15` |
| html.liens_externes | `0` |
| html.canonical_present | `true` |
| html.canonical_hrefs | `['https://embrun.store/']` |
| html.canonical_defaut | `true` |
| html.viewport_presente | `true` |
| html.viewport_valeur | `width=device-width, initial-scale=1` |
| html.liens_a_sans_href | `0` |
| contenu_analyse.erreur_parsing | `null` |

## Données structurées

| mesure | valeur |
|---|---|
| donnees_structurees.blocs | `1` |
| donnees_structurees.blocs_json_valides | `1` |
| donnees_structurees.blocs_json_invalides | `0` |
| donnees_structurees.erreur_parsing | `null` |

- bloc 1 : JSON valide = `true`, longueur = `136`, erreur = `null` (`donnees_structurees.details`)

## Ressources

| mesure | valeur |
|---|---|
| ressources.scripts_inline | `2` |
| ressources.scripts_externes | `1` |
| ressources.images | `0` |
| ressources.liens_a_href | `17` |
| ressources.liens_internes | `15` |
| ressources.liens_externes | `0` |

### Redirections (`requete.records[].redirections`)

| code | location |
|---|---|
| - | (aucune) |

### Vérifications complémentaires (`verifications_complementaires`)

Origine (`verifications_complementaires.origine`) : `https://embrun.store`

| ressource | clé | HEAD | GET | statut retenu | méthode retenue |
|---|---|---|---|---|---|
| https://embrun.store/robots.txt | verifications_complementaires.robots_txt | `200` | `null` | `200` | `HEAD` |
| https://embrun.store/sitemap.xml | verifications_complementaires.sitemap_xml | `200` | `null` | `200` | `HEAD` |

HSTS sur la réponse principale : `null` (`en_tetes.strict-transport-security`)

## Constats

Écarts objectifs uniquement (leur négation ne produit aucune ligne).

| # | vérification | fait mesuré | clé evidence.json |
|---|---|---|---|
| 1 | hsts | strict-transport-security = null | `en_tetes.strict-transport-security` |
