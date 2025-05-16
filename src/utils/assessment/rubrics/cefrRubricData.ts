
/**
 * CEFR Rubric Data
 * Contains the actual CEFR rubric for grammar and syntax evaluation
 */

import { CEFRGrammarSyntaxRubric } from './cefrTypes';

/**
 * The CEFR rubric for grammar and syntax evaluation
 */
export const cefrGrammarSyntaxRubric: CEFRGrammarSyntaxRubric = {
  "cefr_rubric": [
    {
      "level": "A1",
      "grammar": "Can use simple grammatical structures with limited control. Errors are frequent and often distort meaning.",
      "syntax": "Produces very simple, often fragmented sentences. Shows little to no subordination or clause complexity.",
      "examples": {
        "grammar": "I go school. She play with ball.",
        "syntax": "Go to park. Eat lunch."
      },
      "features": [
        "Present simple",
        "Basic conjunctions (and, but)",
        "Common prepositions (in, on, at)"
      ],
      "score_range": [
        1.0,
        2.5
      ]
    },
    {
      "level": "A2",
      "grammar": "Uses basic sentence patterns with reasonable accuracy. Errors do not usually prevent understanding.",
      "syntax": "Simple coordination is present. Limited use of subordination. Word order errors occur.",
      "examples": {
        "grammar": "I went to the shop. He don't like apples.",
        "syntax": "I go school and I learn English."
      },
      "features": [
        "Past simple",
        "Comparative adjectives",
        "Adverbs of frequency",
        "Some modal use (can, must)"
      ],
      "score_range": [
        2.6,
        4.0
      ]
    },
    {
      "level": "B1",
      "grammar": "Shows good control of simple structures. Errors occur in more complex forms but rarely obscure meaning.",
      "syntax": "Can form compound and some complex sentences. Subordination is emerging.",
      "examples": {
        "grammar": "I have visited Paris. I was watching TV when he called.",
        "syntax": "She stayed at home because she was sick."
      },
      "features": [
        "Present perfect",
        "Modal verbs (should, might)",
        "Relative clauses",
        "Zero and first conditionals"
      ],
      "score_range": [
        4.1,
        5.5
      ]
    },
    {
      "level": "B2",
      "grammar": "Demonstrates a relatively high degree of grammatical control. Complex forms handled with some flexibility.",
      "syntax": "Consistent use of subordination, relative clauses, and logical paragraphing. Few structural errors.",
      "examples": {
        "grammar": "He had already left when I arrived.",
        "syntax": "Although it was raining, they continued playing."
      },
      "features": [
        "Passive voice",
        "Second conditional",
        "Reported speech",
        "Complex noun phrases"
      ],
      "score_range": [
        5.6,
        7.0
      ]
    },
    {
      "level": "C1",
      "grammar": "Consistently maintains a high degree of grammatical accuracy. Uses a wide range of forms flexibly.",
      "syntax": "Advanced subordination, embedded structures, and rhetorical framing devices.",
      "examples": {
        "grammar": "Had I known, I would have acted differently.",
        "syntax": "The results, which were surprising, changed our assumptions."
      },
      "features": [
        "Mixed conditionals",
        "Advanced modal verbs (needn't have, might have)",
        "Inversion",
        "Fronting"
      ],
      "score_range": [
        7.1,
        8.5
      ]
    },
    {
      "level": "C2",
      "grammar": "Maintains consistent grammatical control of complex structures. Subtle, nuanced errors are rare.",
      "syntax": "Elegant, highly flexible syntax. Manipulates structure for stylistic effect.",
      "examples": {
        "grammar": "Seldom has there been such interest in the subject.",
        "syntax": "Were it not for his support, the project would have failed."
      },
      "features": [
        "Idiomatic structures",
        "Ellipsis",
        "Cleft sentences",
        "Subtle modality shifts"
      ],
      "score_range": [
        8.6,
        10.0
      ]
    }
  ]
};
