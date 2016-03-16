# csWeb-rules

A rule or scenario engine for csWeb which uses a Domain Specific Language (DSL) for specifying the rules. It can also be used standalone,
allowing you to implement your own DSL.

## Motivation
In several of my projects, I had a need for either a simple to use rule engine that would react with actions when certain conditions are met. 
Typical use cases are:
1. For the Real Time Intelligence project (for the National Police), we need to provide suggestions to the user like hypotheses and actions.
2. For Concept Development & Experimentation, we user must be presented with a (command & control) scenario in order to test new user interfaces.
3. For crisis management training, we need to script the training scenario (the incident) as well as the external, non-present parties.

For example, when a feature was placed on the map, I needed to suggest a number of actions that could be taken. More generically, I needed 
to run a scenario, moving features over a map, sending an email or SMS after some time, or as an automatic response to some input, or starting
a simulation or analysis run. However, specifying such a scenario often requires many meetings with the end user. So wouldn't it be better if he 
could specify the scenario himself? 

My first effort used Windows Workflow Foundation, a workflow engine from Microsoft, in which you can design your own flow elements in C# or 
Visual Basic. Is has innate support for branching and conditionals, uses drag-n-drop, so you can create a workflow easily. Although easy to 
use, it was quite cumbersome to edit (for example, an email), and it was difficult to get a good overview of the complete flow. Especially 
branching made it difficult to see what was going to happen, and getting a good understanding of what would happen in parallel was difficult too.

This project aims to remedy this situation by creating a rule engine that uses an easy to use, and easy to change, Domain Specific Language (DSL)
for specifying a scenario. This should enable domain specialists to easily create a new scenario, and reuse existing scenarios. Also, it allows
the reuse of sub-scenarios. For example, imagine you have a game: you are in a room with three doors. You select door A, and from there on, move
forwards and never come back. That means that whatever sub-scenario or puzzle was behind door B and C will never be played. Besides the wasted
effort put in creating this sub-scenario, it also might mean that the player misses a chance to experience or learn something new. So instead,
the rule engine allows you to offer this sub-scenario again, and the next time the player needs to open a door, he will be offered doors B and
C again.   

## Implementation
This rule engine is loosely based on the Parser Combinator as described in the book [Domain Specific Languages](https://books.google.nl/books?id=ri1muolw_YwC&hl=nl) 
by [Martin Fowler](http://www.martinfowler.com/) and Rebecca Parson. The most advanced DSLs use a Parser Generator with a BNF-like grammar to 
specify their language. [ANTLR](http://www.antlr.org), or Another Tool for Language Recognition is a popular choice. Although elegant, the DSL
that I envisioned was very loosely structured, and I wanted to be able to change it freely and easily, adding new rules as I go. In addition, 
I didn't want to introduce yet another tool in the toolchain, nor requiring others to learn about grammars. ANTLR is typically used in a Java 
environment, with heavy tools like Eclipse to perform your work. I've also considered using [Peg](https://github.com/pegjs/pegjs), a Javascript 
parser generator, which even comes with an online tool to generate your parser. But even the simple example generated a Javascript parser.js file 
of 18kb.

### Lexer
The lexer is responsible for converting the DSL script into a list of tokens (enumerations). It parses the text, using a regular expression 
to recognize the tokens. For more details, see Chapter 20 Regex Table Lexer of the aforemention book.

### Parser Combinator
The parser combinator (Chapter 22) converts the list of tokens to higher level messages. Basically, it follows the same approach as the lexer: 
where the lexer tests a sequence of characters for each token using a regular expression, the parser takes a sequence of tokens it received from 
the lexer, and checks them for each known message. The output is a sequence of messages, where the original input text is represented as an
JSON object. For example, the message:
```
Send email emails.hello from users.alice to users.bob and users.carol
```
is represented as
```json
{
    "method": "sendEmail",
    "emailId": "emails.hello",
    "from": "users.alice",
    "to": ["users.bob", "users.carol"]
}
