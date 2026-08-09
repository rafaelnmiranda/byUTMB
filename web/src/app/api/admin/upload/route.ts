import { NextResponse } from "next/server";

import type { UploadKind } from "@/lib/admin-upload.server";
import { isAdminAuthenticated, isAdminUploadAllowed } from "@/lib/admin-auth.server";
import { saveOptimizedUpload, validateUploadFile, validateUploadPath } from "@/lib/admin-upload.server";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!isAdminUploadAllowed()) {
    return NextResponse.json(
      {
        error:
          "Upload desabilitado neste ambiente. Use em localhost ou defina ADMIN_UPLOADS_ENABLED=true com armazenamento persistente.",
      },
      { status: 403 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const relativePath = String(form.get("relativePath") ?? "").trim();
  const kind = String(form.get("kind") ?? "").trim() as UploadKind;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo obrigatório." }, { status: 400 });
  }

  if (!validateUploadPath(relativePath)) {
    return NextResponse.json({ error: "Destino inválido." }, { status: 400 });
  }

  if (!["logo", "cover", "event"].includes(kind)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }

  const fileError = validateUploadFile(file);
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  try {
    const result = await saveOptimizedUpload(file, relativePath, kind);
    return NextResponse.json(result);
  } catch (error) {
    console.error("admin upload failed", error);
    return NextResponse.json({ error: "Falha ao salvar a imagem." }, { status: 500 });
  }
}
