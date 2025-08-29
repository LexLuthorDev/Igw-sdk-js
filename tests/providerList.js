//import { createClient } from './igw-sdk/src/index.js';
import { createClient } from "../src/index.js";

const igw = createClient({ agentCode: "lexluthor", agentToken: "8047364283b011f08584bc2411881493" });
const r = await igw.providerList();
console.log(r); // deve vir exatamente o JSON de sucesso
