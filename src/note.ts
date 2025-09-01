// Isso é um plugin! Cada plugin tem suas próprias rotas, middlewares e decorators que podem ser aplicados em outras instâncias.
import {Elysia, t} from "elysia"

class Note {
    constructor(public data:string[] = ['Moonhalo']){}

    add(note:string){
        this.data.push(note)
        return this.data
    }

    remove(index: number) {
        return this.data.splice(index,1)
    }

    update(index:number, note:string) {
        return (this.data[index] = note)
    }
}

export const note = new Elysia({prefix: '/note'})
    .decorate('note', new Note())
    .onTransform(function log({body, params, path, request: {method}}) { // on transform é chamado depois de rotear e antes da validação
        console.log(`${method} ${path}`, {
            body, 
            params
        })
    })
    .get('/', ({note}) => note.data)
    .put("/", ({note, body: {data}}) => note.add(data), {
        body: t.Object({
            data: t.String()
        })
    })
    .guard({ // todas as rotas abaixo de guard terão validações para o path parameter index
        params: t.Object({
            index: t.Number()
        })
    })
    .get(
        "/:index",
        ({note, params: {index}, status}) => {
            return note.data[index] ?? status(404, 'Not Found')
        }
    )
    .delete(
        "/:index",
        ({note, params: {index}, status}) => {
            if (index in note.data) return note.remove(index)

            return status(422)
        }
    )
    .patch(
        "/:index",
        ({note, params: {index}, body: {data}, status}) => {
            if (index in note.data) return note.update(index, data)

            return status(422)
        }, {
            body: t.Object({
                data: t.String()
            })
        }
    )
