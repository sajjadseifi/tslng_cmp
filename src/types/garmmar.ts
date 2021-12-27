// export {}
export type Rule = string | (string | RegExp)[]
export type RuleSet = Rule[]
export type Gramer = (string | RegExp[] | RuleSet)[]
export type KeyPairRuleSet = [string, RuleSet]
