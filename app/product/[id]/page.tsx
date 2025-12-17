export default function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Product Page Placeholder</h1>
      <p>Product ID: {params.id}</p>
      <p>Product detail page will be implemented here</p>
    </div>
  )
}

