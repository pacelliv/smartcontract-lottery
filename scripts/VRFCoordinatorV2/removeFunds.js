async function removeFunds() {}

removeFunds()
    .then(() => process.exit(0))
    .catch(() => {
        console.log(error)
        reject(error)
    })
