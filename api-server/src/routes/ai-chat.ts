import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

// ─── IA Embutida (gratuita via Replit AI Integrations) ───────────────────────
// Usa max_tokens máximo para garantir respostas completas
router.post("/ai/chat", async (req, res) => {
  try {
    const { messages, system, stream } = req.body as {
      messages: { role: string; content: string }[];
      system?: string;
      stream?: boolean;
    };

    const baseUrl = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
    const apiKey  = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

    if (!baseUrl || !apiKey) {
      res.status(503).json({ error: "Serviço de IA integrado não configurado. Configure uma chave de API nas configurações." });
      return;
    }

    const useStream = Boolean(stream);

    const reinforcedSystem = system
      ? `${system}

════════════════════════════════════════════════════════
PROTOCOLO ANTI-SILENCIO (OBRIGATORIO):
════════════════════════════════════════════════════════
1. SEMPRE comece a resposta dizendo o que vai fazer ("Vou criar o arquivo X, depois rodar Y...")
2. Em tarefas longas, descreva passo a passo o que esta fazendo, nao gere so o codigo
3. NUNCA termine sem dizer claramente "Pronto, terminei" + lista do que foi feito + qual e o proximo passo
4. Se faltar informacao do usuario, pergunte ANTES de comecar — nunca no meio
5. Mesmo se for executar um comando rapido, escreva uma frase explicando antes
6. Se o pedido for vago, responda primeiro com 1 linha de confirmacao + plano em bullets, e pergunte "posso prosseguir?"
7. Sempre termine cada resposta com: "👉 Proximo passo:" indicando o que o usuario faz agora
8. Voce esta conversando com Saulo, advogado deficiente fisico que usa voz — seja claro, direto, e sempre responsivo`
      : undefined;

    const finalMessages = [
      ...(reinforcedSystem ? [{ role: "system", content: reinforcedSystem }] : []),
      ...messages,
    ];

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: finalMessages,
        max_completion_tokens: 32768,
        stream: useStream,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      let errMsg = errText.slice(0, 400);
      try { const j = JSON.parse(errText); errMsg = j.error?.message ?? errMsg; } catch {}
      res.status(aiRes.status).json({ error: errMsg });
      return;
    }

    if (useStream) {
      // ── Modo streaming: passa o SSE direto para o cliente ──
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      const reader = aiRes.body!;
      (reader as any).pipe(res);
      return;
    }

    const data = await aiRes.json() as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "";
    res.json({ content });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "Erro no chat de IA");
    res.status(500).json({ error: msg });
  }
});

export default router;
