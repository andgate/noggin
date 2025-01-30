Feature: Noggin Application Launch
  As a user
  I want to launch the Noggin application
  So that I can use its features

  Scenario: Application launches successfully
    When I launch the application
    Then I should see the application title "Noggin 🦜🧠"
    And I should see the main application shell
