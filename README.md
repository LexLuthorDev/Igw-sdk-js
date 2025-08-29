/* ===================== README.md ===================== */
});


const r = await igw.providerList();
console.log(r);
```


## Uso (CommonJS)
```js
const { createClient } = require("@lexluthordev/igw-sdk");


(async () => {
const igw = createClient({ agentCode: "lexluthor", agentToken: "SEU_TOKEN" });
const r = await igw.providerList();
console.log(r);
})();
```


## Convenções
- Dinheiro sempre em **centavos** (inteiros), exatamente como na documentação.
- Enviamos apenas campos documentados (snake_case). Sem campos extras.
- Em falha (`status: 0`), o cliente lança erro com `code = msg`.


## Métodos principais
- `createUser({ user_code, is_demo? })`
- `deposit({ user_code, amount })`
- `withdraw({ user_code, amount })`
- `resetUserBalance({ user_code })`
- `resetAllUsersBalance()`
- `setDemo({ user_code })`
- `launchGame({ user_code, provider_code, game_code?, lang? })`
- `providerList()`
- `gameList({ provider_code })`
- `moneyInfo()` / `moneyInfoForUser({ user_code })` / `moneyInfoAllUsers()`
- `getGameLog({ user_code, game_type, start, end, page?, perPage? })`
- `raw(method, payload)`


## Erros mapeados
`INVALID_METHOD`, `INVALID_PARAMETER`, `INVALID_AGENT`, `INVALID_AGENT_ROLE`, `BLOCKED_AGENT`, `INVALID_USER`, `MAX_DEMO_USER`, `INSUFFICIENT_AGENT_FUNDS`, `INSUFFICIENT_USER_FUNDS`, `DUPLICATED_USER`, `INVALID_PROVIDER`, `INTERNAL_ERROR`, `EXTERNAL_ERROR`, `API_CHECKING`, `AGENT_SEAMLESS`.