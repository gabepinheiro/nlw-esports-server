import express from 'express'

const app = express()

app.get('/hello', (req, res) => {
  return res.json({
    name: 'Gabe'
  })
})

app.listen(3333, () => console.log('Listen server port on 3333'))
