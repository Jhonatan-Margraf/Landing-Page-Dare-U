<div align="center">
 
# 🤙 DareU
 
**Desafios malucos. Dinheiro real.**
 
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=for-the-badge)]()
[![Licença](https://img.shields.io/badge/licença-MIT-purple?style=for-the-badge)]()
[![Plataforma](https://img.shields.io/badge/plataforma-Web%20%7C%20Mobile-blueviolet?style=for-the-badge)]()
 
*Alguém paga pra você gritar no ônibus, cantar no sinaleiro ou pedir pizza fazendo voz de robô. Você topa?*
 
</div>
 
---
 
## 🧠 O que é o DareU?
 
DareU é uma rede social de **desafios pagos**. Funciona assim:
 
- Alguém posta um desafio (qualquer coisa, desde que não seja perigoso) e deposita um prêmio em dinheiro
- Outro usuário vê no feed, topa, grava o vídeo cumprindo o desafio e envia como prova
- A IA verifica autenticidade — sem deepfake, sem trapaça
- O criador aprova e o escrow libera o pagamento na hora
 
Pura diversão, com segurança e dinheiro real.
 
---
 
## ✨ Funcionalidades
 
| Feature | Status |
|---|---|
| Feed social de desafios | 🟡 Em desenvolvimento |
| Sistema de escrow (pagamento bloqueado) | 🟡 Em desenvolvimento |
| IA de texto — filtro de desafios ilegais/+18 | 🟡 Em desenvolvimento |
| IA visual — detecção de deepfakes | 🟡 Em desenvolvimento |
| Submissão de vídeo como prova | 🟡 Em desenvolvimento |
| Autenticação (email / Google / Apple) | 🟡 Em desenvolvimento |
| Ranking e perfis públicos | 🔵 Planejado |
| Sistema de disputas | 🔵 Planejado |
| App mobile (iOS / Android) | 🔵 Planejado |
 
---
 
## 🏗️ Arquitetura
 
```
dareu/
├── frontend/          # Interface web (React / Next.js)
├── backend/           # API REST / GraphQL
├── ai/
│   ├── text-filter/   # IA de moderação de texto
│   └── deepfake/      # IA de detecção visual
├── payments/          # Integração escrow (Stripe / Mercado Pago / Pix)
└── infra/             # Cloud config (AWS / Supabase / Railway)
```
 
---
 
## 🤖 Sistemas de IA
 
### Filtro de texto
Analisa cada desafio antes de publicar. Bloqueia automaticamente:
- Conteúdo ilegal ou que incentive crimes
- Desafios perigosos ou que coloquem vida em risco
- Conteúdo +18 ou impróprio
 
### Detector de deepfake
Análise computacional dos vídeos submetidos como prova. Identifica:
- Vídeos gerados ou manipulados por IA generativa
- Face-swaps e alterações faciais
- Inconsistências de metadados e artefatos de compressão suspeitos
 
---
 
## 💸 Modelo de negócio
 
- **Comissão por transação** — percentual sobre cada desafio concluído (modelo principal)
- **Taxa de saque** — pequena taxa ao sacar o saldo acumulado
- **Destaque pago** — impulsionar desafios no feed
- **Assinatura premium** — para criadores frequentes
 
</div>
