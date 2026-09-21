---
name: netlify
description: Operaciones, despliegues y gestión de sitios y variables de entorno en Netlify utilizando el CLI y la API de Netlify.
---

# Netlify Deploy & Management

Instrucciones para desplegar y administrar sitios en Netlify con autenticación mediante token personal.

## Variables de Entorno
- `NETLIFY_AUTH_TOKEN`: `nfp_7Kz74MMDkivrbvkg8mQ4bBAWLArRstHgc473`

## Despliegue de Proyecto Estático
Para desplegar directamente la carpeta actual:
```bash
npx netlify deploy --prod --dir=. --auth=nfp_7Kz74MMDkivrbvkg8mQ4bBAWLArRstHgc473
```
