Feature: Atendimento Automatizado

  Scenario: Cliente recebe resposta do chatbot no WhatsApp
    Given o cliente inicia um atendimento no WhatsApp
    When o chatbot recebe a mensagem
    Then ele deve responder em menos de 3 minutos

  Scenario: Cliente recebe resposta do chatbot no Reclame Aqui
    Given o cliente inicia um atendimento no Reclame Aqui
    When o chatbot recebe a mensagem
    Then ele deve responder em menos de 3 minutos

  Scenario: Cliente não tem sua dúvida resolvida e é transferido para um atendente
    Given o cliente inicia um atendimento no WhatsApp
    And o chatbot não consegue resolver a solicitação
    When o cliente solicita um atendente humano
    Then o sistema deve transferir o atendimento para um humano

  Scenario: Cliente solicita suporte por voz
    Given o cliente está interagindo com o chatbot
    When ele solicita suporte por voz
    Then o sistema deve iniciar uma chamada com o assistente de voz
