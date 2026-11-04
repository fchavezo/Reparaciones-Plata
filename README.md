# Reparaciones Plata · Tickets

Aplicación web para crear, imprimir y consultar los tickets (facturas simplificadas) de **Reparaciones Plata**, un taller de Talavera la Real (Badajoz). Está pensada para usarse en el ordenador del mostrador con una impresora térmica de 58 mm (POS-58), sin servidor ni conexión a internet.

## Funcionalidades

- **Nuevo ticket**: líneas con concepto, precio unitario y unidades; tipo de IVA configurable (21 % por defecto) y cálculo automático de subtotal, IVA y total.
- **Impresión**: genera un ticket de 58 mm con los datos de la empresa y lo manda a imprimir. El número de ticket solo se reserva al imprimir; reimprimir un ticket conserva su número y su fecha original.
- **Historial**: listado de todos los tickets con búsqueda por número, fecha o concepto.
- **Detalle**: consulta de un ticket concreto, con opciones para reimprimirlo o eliminarlo.
- El ticket en edición se mantiene al navegar entre el historial y la pantalla principal.

## Almacenamiento de los datos

Los tickets **no se guardan en el navegador**, sino en un archivo JSON del ordenador, usando la [File System Access API](https://developer.mozilla.org/docs/Web/API/File_System_API):

- Al abrir la aplicación por primera vez se elige un archivo existente o se crea uno nuevo (`tickets.json`).
- El navegador solo recuerda el *handle* del archivo (en IndexedDB) para volver a abrirlo en la siguiente visita; puede pedir de nuevo permiso de acceso.
- Antes de cada escritura se vuelve a leer el archivo, para no sobrescribir cambios hechos fuera de la aplicación.
- La numeración continúa a partir del número más alto del archivo.

Formato del archivo:

```json
{
  "version": 1,
  "tickets": [
    {
      "id": 1,
      "date": "30/10/2026",
      "time": "22:57:30",
      "lines": [{ "id": "…", "concept": "Llaves", "unitPrice": 2.5, "units": 3 }],
      "ivaRate": 21,
      "subtotal": 7.5,
      "ivaAmount": 1.575,
      "total": 9.075
    }
  ]
}
```

> Requiere **Google Chrome** o **Microsoft Edge**; otros navegadores no admiten esta API y la aplicación muestra un aviso.

## Tecnologías

- [React 19](https://react.dev) + TypeScript
- [Vite](https://vite.dev) con [`vite-plugin-singlefile`](https://github.com/richardtallent/vite-plugin-singlefile): la compilación genera un único `index.html` con el JS y el CSS incluidos, para poder abrirlo directamente desde el disco.
- [React Router](https://reactrouter.com) con `HashRouter` (funciona con `file://`).
- [Oxlint](https://oxc.rs) como linter.

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run lint      # análisis con Oxlint
npm run build     # comprobación de tipos y compilación en dist/
npm run preview   # sirve la compilación de dist/
```

## Instalación en el ordenador de la tienda (Windows)

1. Ejecutar `npm run build`.
2. Copiar el contenido de `dist/` (`index.html` y `Abrir Tickets.bat`) a una carpeta del ordenador.
3. Abrir la aplicación con **`Abrir Tickets.bat`**, que la lanza en su propia ventana de Microsoft Edge.
4. La primera vez, crear o seleccionar el archivo `tickets.json` donde se guardarán los tickets (conviene incluirlo en las copias de seguridad).

## Estructura del proyecto

```
src/
├── App.tsx                     # Rutas: /, /historial, /ticket/:id
├── pages/                      # Nuevo ticket, historial y detalle
├── components/
│   ├── Layout/                 # Estructura general y barra lateral
│   ├── TicketForm/             # Formulario y líneas del ticket
│   └── TicketStore/            # Proveedor del estado y selección del archivo
├── hooks/useTicketStore.ts     # Contexto de acceso a los tickets
├── lib/
│   ├── ticket.ts               # Datos de la empresa y HTML de impresión
│   └── ticketFile.ts           # Lectura/escritura del archivo JSON
└── types/ticket.ts             # Tipos y cálculo de totales
public/
└── Abrir Tickets.bat           # Lanzador para Windows
```

## Notas sobre la impresora térmica

- El nombre de la empresa se imprime como **imagen en blanco y negro** porque algunos controladores sustituyen el texto grande en negrita por las fuentes internas de la impresora y salen caracteres erróneos.
- El ancho de impresión y los márgenes se ajustan en la sección **Impresora** de la aplicación (se guardan en cada ordenador) y se pueden comprobar con *Imprimir prueba*. Valores por defecto en `src/lib/printSettings.ts`:
  - **Windows**: 46 mm de ancho. El controlador POS-58 solo imprime la zona central de ~48 mm y corta lo que sobresale, y así también cabe en rollos de 55 mm.
  - **macOS**: 58 mm de ancho y 8 mm de margen superior, porque el controlador pierde la primera franja de cada impresión.
- Los datos de la empresa (nombre, NIF, dirección y teléfono) se configuran en `getCompanyConfig()` de `src/lib/ticket.ts`.
