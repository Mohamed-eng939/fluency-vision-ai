
/**
 * Complex Structures Detection
 * Functions for identifying advanced syntactic structures
 */

/**
 * Count patterns that indicate embedded clauses
 */
export const countEmbeddedClausePatterns = (text: string): number => {
  // Look for patterns like "the fact that", "what she said", etc.
  const patterns = [
    /\b(the fact that)\b/gi,
    /\b(what|whatever|whoever|whenever|wherever|however) .+ (is|was|will|would)\b/gi,
    /\b(that|which|who) .+ (that|which|who)\b/gi  // Nested relative clauses
  ];
  
  return patterns.reduce((count, pattern) => {
    const matches = text.match(pattern) || [];
    return count + matches.length;
  }, 0);
};
