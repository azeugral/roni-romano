# Roni Romano · Hair Design e Visagismo

Site de apresentação do Roni Romano ([@roniromano](https://www.instagram.com/roniromano/)), hair designer, visagista e expert em coloração pessoal. Ele atende no Beleza Urbana Panamby, no Morumbi, em São Paulo.

Publicado em https://azeugral.github.io/roni-romano/, com `noindex` até a aprovação.

## Páginas

- `index.html`: hero, manifesto (frase dele sobre visagismo), serviços, como funciona o atendimento, 12 trabalhos, sobre e formações, bastidores, agendamento pelo WhatsApp e endereço com mapa.
- `trabalhos.html`: 40 fotos em grade 4:5, com filtros (Coloração, Corte, Make e penteado) e foto ampliada.
- `404.html`

## Identidade (v2, 22/10)

- **Cores:** café `#16110d`, caramelo `#b98250` e creme `#f6f1ea`, tiradas dos posts dele.
- **Fontes:** Playfair Display nos títulos, a mesma família dos carrosséis dele, e Manrope no texto. A Bodoni Moda da v1 foi trocada por ser difícil de ler.
- **Forma:** fotos principais em arco, como os espelhos do salão, com moldura caramelo fina.
- **Movimento:** o arco do hero se abre, o nome sobe, uma faixa de serviços corre devagar, os títulos entram por máscara e as fotos em arco ganham paralaxe leve no desktop. Tudo na curva `cubic-bezier(.16,.84,.32,1)` e desligado com `prefers-reduced-motion`.
- **Foto do hero:** `../hero-para-melhorar/roni-hero-hd.png`, a versão melhorada do post 037 enviada pelo Daniel. O `processar.py` usa essa versão quando ela existe.
- **Portfólio:** sem numeração. A categoria aparece em itálico ao passar o mouse; no celular, aparece sempre.

## Ferramentas

```
python -I tools/processar.py   # recorta as fotos de ../_ref/ig em 4:5 (640 e 1080 px, webp)
python -I tools/montar.py      # injeta a grade no index e monta trabalhos.html e 404.html
python -I tools/og.py          # prévia de link (og.jpg) e favicons
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
- [ ] **Logo**: hoje o nome está composto em Bodoni Moda. Se ele tiver logo ou assinatura, substituir.
- [ ] **Domínio** (sugestão: roniromano.com.br) e remover o `noindex`.

Site por [L R G Z](https://lrgz.com.br).
