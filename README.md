# Roni Romano · Hair Design e Visagismo

Site de apresentação do Roni Romano ([@roniromano](https://www.instagram.com/roniromano/)), hair designer, visagista e expert em coloração pessoal. Ele atende no Beleza Urbana Panamby, no Morumbi, em São Paulo.

Publicado em https://azeugral.github.io/roni-romano/, com `noindex` até a aprovação.

## Páginas

- `index.html`: hero, manifesto (frase dele sobre visagismo), serviços, como funciona o atendimento, 12 trabalhos, sobre e formações, bastidores, agendamento pelo WhatsApp e endereço com mapa.
- `trabalhos.html`: 40 fotos em grade 4:5, com filtros (Coloração, Corte, Make e penteado) e foto ampliada.
- `404.html`

## Identidade (versão final de apresentação, 22/10)

- **Logo oficial:** `../_ref/logo/logo-oficial.png`, monograma RR dourado + "RONI ROMANO". O `tools/logo.py` recorta o monograma e o letreiro para o cabeçalho, a logo completa para o rodapé, e gera as favicons (RR dourado no café) e o `og.jpg`.
- **Cores:** café `#16110d`, caramelo `#b98250` e creme `#f6f1ea`, que conversam com o dourado da logo.
- **Fontes:** Playfair Display nos títulos e Manrope no texto.
- **Hero:** texto à esquerda e retrato à direita em altura total (foto melhorada do post 037, `../hero-para-melhorar/roni-hero-hd.png`). Uma fumaça leve creme/caramelo corre à esquerda: shader ao vivo no desktop (`assets/fumaca.js`) e MP4 em loop no celular (`assets/video/fumaca-celular.mp4`, gerado por `tools/gerar_fumaca.py`).
- **Forma:** serviços e portfólio em fotos retas 4:5; o arco aparece no "Sobre", nas etapas do atendimento e no mapa.
- **Movimento:** curva `cubic-bezier(.16,.84,.32,1)`, faixa de serviços correndo, títulos por máscara e paralaxe leve no desktop. Tudo desligado com `prefers-reduced-motion`.
- **Portfólio:** sem numeração; a categoria aparece em itálico.

## Ferramentas

```
python -I tools/processar.py   # recorta as fotos de ../_ref/ig em 4:5 (640 e 1080 px, webp)
python -I tools/montar.py      # injeta a grade no index e monta trabalhos.html e 404.html
python -I tools/logo.py        # logo, favicons e prévia de link (og.jpg)
python -I tools/gerar_fumaca.py # vídeo da fumaça do celular (e --teste para um quadro)
```

Os originais estão em `../_ref/ig`: 168 posts extraídos do Instagram em 22/10/2026. As legendas ficam em `../_ref/legendas.txt` e as folhas de contato em `../_ref/folhas`.

## CONFIRMAR antes do domínio

- [ ] **WhatsApp**: foi usado o (11) 98299-1393, que é o link da bio dele. Confirmar que é o número de agendamento, e não o do salão (o do Beleza Urbana é (11) 95493-0347).
- [ ] **Endereço**: foi usado o do Beleza Urbana Panamby, Rua Deputado João Sussumu Hirata, 43, tirado do Instagram do salão. Posts antigos citam MG Hair Design (Jardins) e Dopamina Hair; confirmar que hoje ele atende só no Panamby.
- [ ] **Horários e períodos** do formulário (manhã, tarde, noite e sábado). Ainda não há horário real de atendimento.
- [ ] **Serviços**: confirmar se maquiagem e noivas (cabelo + make) continuam sendo oferecidos no Panamby. Os posts de maquiagem eram da época da Dopamina Hair.
- [ ] **Coloração pessoal**: confirmar o formato (duração, entrega de cartela física ou digital) e se é feita no salão.
- [ ] **Formações**: os nomes foram tirados das legendas (Redken, Llongueras, Mermaid Hair Co., Studio Immagine/Silvana Lopes, HCF Brasil, Hair Summit, L'Oréal). Confirmar a grafia e se ele quer citar todas.
- [ ] **Valores**: não foram publicados.
- [ ] **Fotos de clientes**: confirmar que as clientes autorizam aparecer no site (já estão públicas no perfil dele).
- [ ] **Domínio** (sugestão: roniromano.com.br) e remover o `noindex`.

Site por [L R G Z](https://lrgz.com.br).
