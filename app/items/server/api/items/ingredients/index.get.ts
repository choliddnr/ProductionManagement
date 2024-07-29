export default defineEventHandler(async(event)=>{
    const productid = getQuery(event).id as string
    return await usePocketbase().collection('ingredients').getFullList({
        filter:usePocketbase().filter("product = {:productid}", {productid:productid})
    }) 
})