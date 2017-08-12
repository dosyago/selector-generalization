# Documentation

## Selection Gotchas

- You can only subtract a more specific set from a less specific set, not the otherway around. This ought to be obvious from the way that specificity works, and also how it arises out of the nexted, tree structure of HTML ( more specific is deeper in the tree ), but it is not always obvious. If something provided as negative example is less specific than the positive exmaples, then those negative exmaples will include the positive examples, and so the result will not be as intended. If one wanted to only have a set of more specific examples, and not some less specific ones, then one ought to combine a number of sets of more specific ones, that never included the less specific ones, rather than trying to subtract away something less specific from something more specific. I shall open an issue to detect when the negative example is more specific than the positive, and notify the human.
