import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseCSV, parseCSVToObjects } from "../csv";
import { buildSchedule, isEventLive, zonedWallTimeToUTC } from "../schedule";

const fixture = readFileSync(join(__dirname, "fixtures/schedule.csv"), "utf8");

describe("parser de CSV", () => {
  it("respeita aspas em campo com vírgula (o bug do app iOS)", () => {
    const line = `2025-09-18,11:00,Podcast Montanhista,"Episódio inaugural, ao vivo da Expo.",EXPO,3600,entretenimento,podcast_cover`;
    const [row] = parseCSV(line);

    expect(row).toHaveLength(8);
    expect(row[3]).toBe("Episódio inaugural, ao vivo da Expo.");
    expect(row[4]).toBe("EXPO");
    expect(row[6]).toBe("entretenimento");
  });

  it("entende aspas escapadas", () => {
    const [row] = parseCSV(`a,"disse ""oi"" ontem",c`);
    expect(row[1]).toBe('disse "oi" ontem');
  });

  it("aguenta quebra de linha dentro de um campo", () => {
    const rows = parseCSV(`a,"linha 1\nlinha 2",c\nd,e,f`);
    expect(rows).toHaveLength(2);
    expect(rows[0][1]).toBe("linha 1\nlinha 2");
    expect(rows[1]).toEqual(["d", "e", "f"]);
  });

  it("lida com CRLF e BOM do Google Sheets", () => {
    const rows = parseCSV("﻿a,b\r\nc,d\r\n");
    expect(rows).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("normaliza cabeçalhos com acento e maiúscula", () => {
    const [row] = parseCSVToObjects("Data,Hora,Título\n2025-09-18,10:00,Expo");
    expect(row["titulo"]).toBe("Expo");
  });
});

describe("fuso horário", () => {
  it("interpreta a hora da planilha como horário de Paraty, não do servidor", () => {
    // 10:00 em Paraty (UTC-3) é 13:00 UTC — o erro clássico seria devolver 10:00Z.
    expect(zonedWallTimeToUTC("2025-09-18", "10:00").toISOString()).toBe(
      "2025-09-18T13:00:00.000Z",
    );
  });
});

describe("horário final informado pela planilha", () => {
  it("usa hora_final e deriva a duração do intervalo", () => {
    const csv = [
      "data,hora,titulo,descricao,local,hora_final,tipo,imagem",
      "17/09/2026,10:00,UTMB EXPO,Expo aberta,EXPO,21:00,entretenimento,expo_main",
    ].join("\n");

    const [event] = buildSchedule(csv).events;

    expect(event.startsAt).toBe("2026-09-17T13:00:00.000Z");
    expect(event.endsAt).toBe("2026-09-18T00:00:00.000Z");
    expect(event.durationSeconds).toBe(39600);
  });

  it("mantém evento pontual quando hora_final está vazia", () => {
    const csv = [
      "data,hora,titulo,descricao,local,hora_final,tipo,imagem",
      "19/09/2026,15:00,Limite PTR 25,Tempo de corte,ARENA,,esporte,limit_cover",
    ].join("\n");

    const [event] = buildSchedule(csv).events;

    expect(event.endsAt).toBeNull();
    expect(event.durationSeconds).toBeNull();
  });

  it("interpreta horário final anterior ao início como dia seguinte", () => {
    const csv = [
      "data,hora,titulo,descricao,local,hora_final,tipo,imagem",
      "19/09/2026,23:30,Atividade noturna,Travessia,ARENA,01:00,esporte,night",
    ].join("\n");

    const [event] = buildSchedule(csv).events;

    expect(event.endsAt).toBe("2026-09-20T04:00:00.000Z");
    expect(event.durationSeconds).toBe(5400);
  });
});

describe("programação a partir da planilha real", () => {
  const schedule = buildSchedule(fixture);

  it("carrega todos os 31 eventos, sem descartar nenhuma linha", () => {
    expect(schedule.events).toHaveLength(31);
    expect(schedule.skipped).toBe(0);
  });

  it("deriva os dias dos dados, sem datas fixas no código", () => {
    expect(schedule.days.map((day) => day.key)).toEqual([
      "2025-09-18",
      "2025-09-19",
      "2025-09-20",
      "2025-09-21",
    ]);
    expect(schedule.days.map((day) => day.count)).toEqual([9, 10, 7, 5]);
  });

  it("classifica corretamente as linhas que tinham vírgula na descrição", () => {
    // No app iOS estas 4 linhas deslocavam as colunas: a largada da UTSB110
    // aparecia como "entretenimento" e com o local errado.
    const largada = schedule.events.find((event) => event.title === "Largada / Start UTSB110");

    expect(largada?.type).toBe("esporte");
    expect(largada?.location).toBe("ARENA");
    expect(largada?.description).toContain(",");
  });

  it("aceita hora de um dígito", () => {
    const treino = schedule.events.find((event) => event.title === "Treinão Mombora");

    expect(treino).toBeDefined();
    expect(treino?.startsAt).toBe("2025-09-19T10:30:00.000Z"); // 07:30 em Paraty
  });

  it("não inventa horário de fim quando a planilha deixa duração vazia", () => {
    const abertura = schedule.events.find((event) => event.title.includes("Abertura Oficial"));
    expect(abertura?.durationSeconds).toBeNull();
    expect(abertura?.endsAt).toBeNull();
  });

  it("mantém duração quando a planilha informa segundos", () => {
    const expo = schedule.events.find((event) => event.title === "UTMB EXPO");
    expect(expo?.durationSeconds).toBe(39600);
    expect(expo?.endsAt).not.toBeNull();
  });

  it("ordena por horário de início", () => {
    const times = schedule.events.map((event) => event.startsAt);
    expect([...times].sort()).toEqual(times);
  });

  it("gera slugs únicos e legíveis para compartilhar", () => {
    const slugs = schedule.events.map((event) => event.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain("utmb-expo-09181000");
  });
});

describe("tolerância a planilha malformada", () => {
  it("descarta a linha ruim sem derrubar as boas", () => {
    const csv = [
      "data,hora,titulo,descricao,local,duracao,tipo,imagem",
      "2025-09-18,10:00,Bom,ok,EXPO,3600,esporte,img",
      "linha,sem,sentido",
      ",,,,,,,", // linha em branco: descartada já no CSV, nem chega a contar como erro
      "2025-09-18,25:99,Hora inválida,ok,EXPO,3600,esporte,img",
      "2025-09-18,12:00,Outro bom,ok,EXPO,3600,ativacao,img",
    ].join("\n");

    const schedule = buildSchedule(csv);

    expect(schedule.events.map((event) => event.title)).toEqual(["Bom", "Outro bom"]);
    expect(schedule.skipped).toBe(2);
  });
});

describe("agenda de 2026 publicada na planilha", () => {
  // Fixture exportado da planilha de produção: serve de regressão e de backup.
  const csv = readFileSync(join(__dirname, "fixtures/agenda-2026.csv"), "utf8");
  const schedule = buildSchedule(csv);

  it("carrega os 38 itens sem descartar linha", () => {
    expect(schedule.events).toHaveLength(38);
    expect(schedule.skipped).toBe(0);
  });

  it("cobre os 4 dias oficiais, 17 a 20 de setembro de 2026", () => {
    expect(schedule.days.map((day) => day.key)).toEqual([
      "2026-09-17",
      "2026-09-18",
      "2026-09-19",
      "2026-09-20",
    ]);
  });

  it("lê o formato de data brasileiro que o Sheets gera", () => {
    // A planilha traz 17/09/2026, não 2026-09-17.
    expect(csv).toContain("17/09/2026");
    expect(schedule.events[0].dayKey).toBe("2026-09-17");
  });

  it("usa os três tipos de evento", () => {
    const tipos = new Set(schedule.events.map((event) => event.type));
    expect(tipos).toEqual(new Set(["esporte", "entretenimento", "ativacao"]));
  });

  it("tem entretenimento em todos os dias", () => {
    for (const day of schedule.days) {
      const doDia = schedule.events.filter((event) => event.dayKey === day.key);
      expect(doDia.some((event) => event.type === "entretenimento")).toBe(true);
    }
  });

  it("marca largada como ao vivo só na janela após o início", () => {
    const csv = readFileSync(join(__dirname, "fixtures/agenda-2026.csv"), "utf8");
    const { events } = buildSchedule(csv);
    const largada = events.find((e) => e.title.includes("Largada / Start PTR 108"));
    expect(largada?.endsAt).toBeNull();

    const start = Date.parse(largada!.startsAt);
    expect(isEventLive(largada!, start)).toBe(true);
    expect(isEventLive(largada!, start + 30 * 60 * 1000)).toBe(true);
    expect(isEventLive(largada!, start + 46 * 60 * 1000)).toBe(false);
  });
});
