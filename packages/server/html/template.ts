export const htmlStart = (bootstrapCss, styleTags) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="nolotus" />
    <title>nolotus</title>
    <link rel="stylesheet" href="${bootstrapCss}">
    ${styleTags}
    <script>
      function $U(h, s) {
        document.getElementById(h)?.remove();
        document.getElementById(h.replace('ST', 'SR'))?.remove();
      }
    </script>
  </head>
  <body>
`;

export const htmlEnd = `
  </body>
</html>
`;
