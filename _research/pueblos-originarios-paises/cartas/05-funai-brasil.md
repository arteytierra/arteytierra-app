# Carta 5 — FUNAI Brasil

**Canal:** Plataforma Fala.BR — https://falabr.cgu.gov.br/
**Alternativa (só se o sistema estiver indisponível):** `sic@funai.gov.br`
**Assunto:** Pedido de autorização para transformação e uso comercial das camadas geográficas da FUNAI, e de endpoint estável

> Canal verificado em **25/09/2026** na página oficial do serviço no gov.br
> («Registrar Solicitação de Acesso a Informação à Funai na Plataforma
> Fala.BR»). A própria FUNAI indica que o pedido de acesso à informação deve ser
> registrado no Fala.BR e que o e-mail do SIC serve apenas de contingência. O
> serviço está aberto a «todas as pessoas físicas e jurídicas, independente de
> idade ou nacionalidade», então não faz falta CPF brasileiro.
>
> **Esta carta vai em português de propósito.** É o único dos cinco pedidos
> dirigido a um órgão brasileiro.
>
> Prazo legal da Lei de Acesso à Informação (Lei n.º 12.527/2011): 20 dias
> corridos, prorrogáveis por mais 10 com justificativa. Se passar desse prazo,
> cabe recurso pela própria plataforma — o Fala.BR dá login e senha justamente
> para isso.

---

À
Fundação Nacional dos Povos Indígenas — FUNAI
Coordenação-Geral de Geoprocessamento — CGGEO
Serviço de Informação ao Cidadão — SIC

Prezados Senhores,

Escrevo em nome da **Arte y Tierra**, um estúdio de desenho regenerativo do
território, sediado na Argentina. Desenvolvemos o **acequia**
(https://acequia.app), um aplicativo web que ajuda quem trabalha uma propriedade
rural a ler o seu território: clima, relevo, solo, hidrologia. É um produto pago,
com um plano gratuito.

Uma das seções do acequia responde **quais são os povos originários do lugar onde
está a propriedade**, sempre segundo as fontes oficiais de cada país e sempre
citando o órgão de origem. O Brasil já está incorporado com os resultados do
**Censo Demográfico 2022 do IBGE**: mostramos o número de pessoas indígenas do
município onde cai a propriedade e o total nacional de 1.694.836 pessoas, com a
citação ao IBGE e o link para a tabela oficial. Documentamos também que cada
pessoa pôde declarar até duas etnias, para não somar rótulos como se fossem
pessoas.

Queremos agora incorporar a **informação territorial da FUNAI**, e para isso
precisamos de uma autorização escrita. Preferimos pedir antes do que presumir.

## O que usaríamos

Duas camadas publicadas pela CGGEO na página de Geoprocessamento e Mapas:

1. **Terras Indígenas** — 639 polígonos, nas suas diferentes situações
   (regularizadas, declaradas, delimitadas, homologadas, em estudo e encaminhadas
   como RI).
2. **Aldeias — dados geográficos** (`Funai:aldeias_pontos`) — 4.676 registros,
   dos quais 4.667 ativos, com código de aldeia, terra indígena, município,
   coordenação regional e coordenadas.

## Como usaríamos, e o que não faríamos

Este ponto é o mais importante do pedido, e queremos ser explícitos.

**Não republicaríamos as coordenadas das aldeias.** O que o aplicativo mostraria
é se a propriedade do usuário **está dentro de uma Terra Indígena, ou a que
distância dela está**, nomeando a Terra Indígena e os povos conforme a FUNAI os
nomeia, com a citação «FUNAI — Coordenação-Geral de Geoprocessamento» e o link
para a página oficial. A camada de aldeias entraria apenas como contagem agregada
por Terra Indígena — «esta TI registra N aldeias» —, não como pontos
localizáveis no mapa.

Também não haveria download dos arquivos a partir do nosso aplicativo, não
apresentaríamos o dado como próprio, e não publicaríamos sítios sagrados,
calendários cerimoniais nem qualquer informação que a FUNAI não publique.

A razão de propor esse limite é simples: entendemos que o valor de mostrar a
alguém que a sua propriedade faz limite com uma Terra Indígena é informar e
prevenir conflitos, e que publicar a localização exata de aldeias num produto
comercial teria um efeito diferente desse. Se a FUNAI considerar que mesmo essa
contagem agregada por Terra Indígena não é adequada, retiramos a camada de
aldeias do pedido e ficamos apenas com a de Terras Indígenas.

## O que pedimos — duas coisas

**1. Um esclarecimento sobre a licença, e a autorização que dele decorra.**

A página de Geoprocessamento e Mapas declara que «o conteúdo dos arquivos
correspondentes a geoprocessamento e mapas poderão ser reproduzidos desde que
citada a fonte, excetuando os casos especificados em contrário». Ao mesmo tempo,
o rodapé geral do site publica o conteúdo sob **Creative Commons
Atribuição-SemDerivações 3.0 Não Adaptada**, que não admite obras derivadas.

Montar uma camada geográfica num aplicativo implica necessariamente
transformá-la — reprojeção, simplificação de geometria, indexação espacial —, o
que é uma derivada no sentido da licença. Daí a dúvida, e o pedido:

- A autorização específica da página de geoprocessamento prevalece sobre o
  CC BY-ND do rodapé para esses arquivos, ou o rodapé se aplica também a eles?
- Em qualquer dos casos, a FUNAI autoriza a **transformação técnica** descrita e
  o **uso comercial** nos termos acima, com atribuição?

Se a resposta for que o CC BY-ND se aplica e não há autorização adicional, é uma
resposta suficiente: não montamos a camada. O que não queremos é montá-la
assumindo uma permissão que não foi dada.

**2. Um endereço estável de download, num formato aberto.**

Na verificação de **20/09/2026**, os links WFS que a página oferece para XLSX e
CSV da camada `aldeias_pontos` responderam **HTTP 403 Forbidden**, tanto em
navegador como em download direto. O espelho ODS
(`https://mapas2.funai.gov.br/portal_mapas/ods/aldeias_pontos.ods`) respondeu
HTTP 200, com `Last-Modified` de 13/11/2025, e abriu corretamente: 4.676 linhas,
13 colunas, nenhuma coordenada ausente.

Agradeceríamos saber se o 403 é uma restrição intencional de acesso automatizado
ou uma indisponibilidade, e qual endereço a FUNAI recomenda como estável. Não
implementaremos consultas automáticas contra o WFS enquanto isso não estiver
claro: preferimos uma atualização manual periódica a gerar tráfego não previsto
sobre um serviço público.

## Sobre a comparação entre as fontes

Registramos, para que conste, que tratamos as quatro unidades como distintas e
não as comparamos entre si: 4.676 pontos de aldeia, 639 polígonos de Terra
Indígena, as localidades indígenas do IBGE e as 1.694.836 pessoas do Censo 2022
medem coisas diferentes. Também conservamos os 9 registros inativos da camada de
aldeias em vez de filtrá-los silenciosamente, porque filtrar `flag_ativo` muda o
total de 4.676 para 4.667 e isso precisa ficar documentado.

Se o pedido precisar ser apresentado por outra via, em outro formato, ou dirigido
a outra coordenação, agradeceremos a indicação e o reapresentaremos como
corresponder.

Atenciosamente,

**Jonatan [APELLIDO]**
Arte y Tierra — acequia
hola@arteytierra.org · [TELÉFONO CON CÓDIGO DE PAÍS]
https://acequia.app · https://arteytierra.org
