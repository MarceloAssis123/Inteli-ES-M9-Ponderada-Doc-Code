Feature: Cancelamento de Pedidos

  Scenario: Cancelamento de pedido acima de R$1000 não permitido
    Given um pedido de R$1200 foi realizado
    When o cliente tenta cancelar o pedido
    Then o sistema deve bloquear o cancelamento
    And exibir a mensagem "Cancelamento não permitido para pedidos acima de R$1000"

  Scenario: Cancelamento de pedido abaixo de R$1000 com taxa aplicada
    Given um pedido de R$800 foi realizado
    When o cliente tenta cancelar o pedido
    Then o sistema deve permitir o cancelamento
    And aplicar uma taxa de cancelamento
    And exibir a mensagem "Cancelamento realizado com taxa de R$XX"

  Scenario: Cancelamento de pedido em transporte
    Given um pedido de R$900 está "Em Transporte"
    When o cliente tenta cancelar o pedido
    Then o sistema deve permitir o cancelamento
    And aplicar uma taxa de cancelamento
    And exibir a mensagem "Cancelamento realizado, entregador deve devolver o pedido"
