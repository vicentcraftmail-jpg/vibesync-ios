# VibeSync iOS — build de IPA sin firma

Proyecto Capacitor de VibeSync para compilar un `.ipa` **sin firma** en macOS
(GitHub Actions `macos-15`). El IPA sin firma sirve para:

- inspección del bundle,
- firmarlo con Sideloadly/AltStore usando un Apple ID,
- reenviarlo a un Mac con Xcode para firmarlo con un Team de Apple Developer.

Para App Store hace falta firma con una cuenta Apple Developer y subirlo con
Xcode/Transporter; este repo no incluye certificados ni contraseñas.

## Ejecutar

El workflow `.github/workflows/ios-unsigned.yml` corre en cada push a `main` o
manualmente con **Run workflow**. Descargá el artifact
`VibeSync-unsigned-ipa` → `VibeSync-unsigned.ipa`.

## Local en una Mac

```bash
xcodebuild -project ios/App/App.xcodeproj -target App -configuration Release \
  -sdk iphoneos -derivedDataPath build \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" build

mkdir -p build/ipa/Payload
cp -R build/Build/Products/Release-iphoneos/App.app build/ipa/Payload/
(cd build/ipa && zip -qry VibeSync-unsigned.ipa Payload)
```

Bundle: `com.vibesync.app` · deployment target iOS 15 · Capacitor 8.6.2.
