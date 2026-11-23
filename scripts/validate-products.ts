import { loadAllProducts } from "../lib/products/load";
import { GROUP_LABELS, GROUP_ORDER } from "../lib/products/schema";

try {
  const products = loadAllProducts();
  const published = products.filter((p) => p.status === "published");
  const summary = GROUP_ORDER.map(
    (group) => `${GROUP_LABELS[group]}: ${published.filter((p) => p.group === group).length}`,
  ).join(" · ");
  console.log(
    `✔ ${products.length} productos válidos (${published.length} publicados). ${summary}`,
  );
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
