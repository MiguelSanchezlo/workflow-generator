# Guía de Despliegue - Workflow Generator

El proyecto está **100% listo** para desplegar. Elige una de las siguientes opciones:

## 📦 Archivos Incluidos para Despliegue

- ✅ `dist/` - Build de producción optimizado (64 KB comprimido)
- ✅ `vercel.json` - Configuración para Vercel
- ✅ `netlify.toml` - Configuración para Netlify
- ✅ `.github/workflows/deploy-pages.yml` - Workflow para GitHub Pages
- ✅ `workflow-generator-dist.zip` - Paquete comprimido del build

---

## 🚀 Opción 1: Netlify (MÁS RÁPIDO - 2 minutos)

### Método A: Drag & Drop (Sin cuenta necesaria)

1. Ve a: https://app.netlify.com/drop
2. Arrastra la carpeta `dist/` (o el archivo `workflow-generator-dist.zip`)
3. ¡Listo! Tendrás una URL en segundos

### Método B: Con repositorio GitHub

1. Sube el proyecto a GitHub
2. Ve a https://app.netlify.com
3. Clic en "Add new site" → "Import an existing project"
4. Conecta tu repositorio
5. Configuración automática detectada desde `netlify.toml`
6. Clic en "Deploy"

**URL de ejemplo:** `https://workflow-generator-xyz.netlify.app`

---

## 🚀 Opción 2: Vercel (Recomendado para producción)

### Método A: Con CLI (Requiere permisos sudo)

```bash
sudo npm install -g vercel
vercel login
vercel
```

### Método B: Desde GitHub (MÁS FÁCIL)

1. Sube el proyecto a GitHub
2. Ve a https://vercel.com/new
3. Importa tu repositorio
4. Configuración automática detectada desde `vercel.json`
5. Clic en "Deploy"

**URL de ejemplo:** `https://workflow-generator.vercel.app`

---

## 🚀 Opción 3: GitHub Pages (Gratis)

1. Sube el proyecto a GitHub
2. Ve a Settings → Pages
3. Selecciona "GitHub Actions" como source
4. El workflow `.github/workflows/deploy-pages.yml` ya está configurado
5. Haz push y el sitio se desplegará automáticamente

**URL:** `https://[tu-usuario].github.io/workflow-generator`

---

## 🚀 Opción 4: Azure Static Web Apps

1. Ve al [Portal de Azure](https://portal.azure.com)
2. Crea un "Static Web App"
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Build preset:** Vite
   - **App location:** `/`
   - **Output location:** `dist`
5. Azure creará automáticamente un workflow de GitHub Actions

**URL de ejemplo:** `https://workflow-generator.azurestaticapps.net`

---

## 🚀 Opción 5: Cloudflare Pages

1. Ve a https://pages.cloudflare.com
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Framework preset:** Vite
4. Despliega

**URL de ejemplo:** `https://workflow-generator.pages.dev`

---

## 🚀 Opción 6: AWS S3 + CloudFront

```bash
# Instalar AWS CLI
sudo apt install awscli

# Configurar credenciales
aws configure

# Crear bucket S3
aws s3 mb s3://workflow-generator-app

# Configurar bucket para hosting
aws s3 website s3://workflow-generator-app --index-document index.html

# Subir archivos
aws s3 sync dist/ s3://workflow-generator-app --acl public-read

# (Opcional) Crear distribución CloudFront para HTTPS
```

---

## 📊 Comparación de Plataformas

| Plataforma | Velocidad | Gratis | SSL | CDN | Dificultad |
|------------|-----------|--------|-----|-----|------------|
| Netlify Drop | ⚡⚡⚡ | ✅ | ✅ | ✅ | Muy Fácil |
| Vercel | ⚡⚡⚡ | ✅ | ✅ | ✅ | Fácil |
| GitHub Pages | ⚡⚡ | ✅ | ✅ | ✅ | Fácil |
| Cloudflare | ⚡⚡⚡ | ✅ | ✅ | ✅ | Fácil |
| Azure | ⚡⚡ | ✅* | ✅ | ✅ | Media |
| AWS S3 | ⚡⚡ | ❌ | Requiere CloudFront | Con CloudFront | Media |

*Azure ofrece plan gratuito limitado

---

## 🔥 DESPLIEGUE RÁPIDO (Recomendación)

### Para máxima velocidad (2 minutos):

```bash
# 1. Ve a: https://app.netlify.com/drop
# 2. Arrastra el archivo workflow-generator-dist.zip
# 3. ¡Listo!
```

### Para mejor rendimiento a largo plazo:

1. Sube el proyecto a GitHub
2. Ve a https://vercel.com/new
3. Importa el repositorio
4. Deploy automático

---

## ✅ Verificación Post-Despliegue

Después de desplegar, verifica:

1. ✅ La aplicación carga correctamente
2. ✅ Los workflows se generan al seleccionar opciones
3. ✅ El editor Monaco funciona
4. ✅ Se pueden copiar/descargar workflows
5. ✅ El botón "Save Configuration" funciona
6. ✅ El historial guarda configuraciones

---

## 🆘 Solución de Problemas

### Error: "Cannot find module"
- Ejecuta `npm run build` nuevamente
- Verifica que `dist/` tenga archivos

### Error 404 en rutas
- Asegúrate de que las configuraciones de redirect estén aplicadas
- En Netlify: Verifica `netlify.toml`
- En Vercel: Verifica `vercel.json`

### El editor no carga
- Verifica que los assets en `dist/assets/` se carguen correctamente
- Revisa la consola del navegador

---

## 📝 Archivos de Configuración Incluidos

- `vercel.json` - Configuración Vercel con redirects para SPA
- `netlify.toml` - Configuración Netlify con build settings
- `.github/workflows/deploy-pages.yml` - CI/CD para GitHub Pages
- `workflow-generator-dist.zip` - Build comprimido listo para subir

---

## 🎉 ¡Tu aplicación está lista!

El generador de workflows CI/CD está optimizado y listo para servir a usuarios de todo el mundo.

**Build info:**
- Tamaño: 64 KB (gzip)
- Tiempo de build: 2.33s
- Módulos: 52
- Optimizaciones: Code splitting, tree-shaking, minificación

---

**¿Necesitas ayuda?** Abre un issue en el repositorio de GitHub.
