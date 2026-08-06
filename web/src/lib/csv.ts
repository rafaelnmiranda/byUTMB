/**
 * Parser de CSV conforme RFC 4180.
 *
 * O app iOS quebrava aqui: dividia a linha por vírgula e ignorava as aspas, o que
 * deslocava as colunas em todo evento cuja descrição continha vírgula. Este parser
 * varre o documento inteiro (não linha a linha), então também aguenta quebra de
 * linha dentro de um campo entre aspas.
 */
export function parseCSV(input: string): string[][] {
  // Remove BOM — o Google Sheets às vezes manda.
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'; // aspas escapadas ("")
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    switch (char) {
      case '"':
        inQuotes = true;
        i++;
        break;
      case ",":
        endField();
        i++;
        break;
      case "\r":
        // \r\n conta como uma quebra só
        if (text[i + 1] === "\n") i++;
        endRow();
        i++;
        break;
      case "\n":
        endRow();
        i++;
        break;
      default:
        field += char;
        i++;
    }
  }

  // Último campo/linha, se o arquivo não terminar em quebra de linha
  if (field.length > 0 || row.length > 0) endRow();

  // Descarta linhas totalmente vazias (rodapé em branco da planilha)
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/**
 * Converte as linhas em objetos usando a primeira linha como cabeçalho.
 * Cabeçalhos são normalizados (minúsculas, sem acento) para tolerar edição manual.
 */
export function parseCSVToObjects(input: string): Record<string, string>[] {
  const rows = parseCSV(input);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);

  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = (row[index] ?? "").trim();
    });
    return obj;
  });
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
