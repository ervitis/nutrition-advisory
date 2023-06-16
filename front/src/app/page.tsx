'use client';

import React from "react";

type Advise = {
    question: string
}

type FormData = {
    calories: number
    weight: number
    ingredients: string
}

type Response = {
    advise: string
}

export default function Home() {
    const [connected, setConnected] = React.useState<boolean>(false)
    const [formAdvice, setFormAdvice] = React.useState<FormData>({
        calories: 0,
        ingredients: "",
        weight: 0
    })
    const [advise, setAdvise] = React.useState<Advise | undefined>(undefined)
    const [loading, setLoading] = React.useState<boolean>(false)

    const wsCurrent = React.useRef<WebSocket | null>(null)

    const retryConnectionCallback = React.useCallback(() => {
        for (let i = 0; i < 3; i++) {
            const r = (Math.floor(Math.random() * 7) + 3) * 1000
            setTimeout(() => {
                if (!wsCurrent.current || wsCurrent.current.CLOSED) {
                    wsCurrent.current = new WebSocket("ws://127.0.0.1:8080/advisory")
                    setConnected(true)
                    return
                }
            }, r)
        }
    }, [wsCurrent])

    React.useEffect((): any => {
        wsCurrent.current = new WebSocket("ws://127.0.0.1:8080/advisory")
        wsCurrent.current.onopen = () => {
            setConnected(true)
        }
        wsCurrent.current.onclose = () => {
            setConnected(false)
        }
        wsCurrent.current.onerror = (ev) => {
            retryConnectionCallback()
            if (!wsCurrent.current || wsCurrent.current.CLOSED || wsCurrent.current.CONNECTING) {
                setAdvise({question: 'Error: reload page'})
                setConnected(false)
            }
        }
        wsCurrent.current.onmessage = (ev) => {
            const data: Response = JSON.parse(ev.data)
            setAdvise({question: data.advise})
            setLoading(false)
        }
    }, [wsCurrent, connected, setLoading, retryConnectionCallback])

    const sendQuestion = React.useCallback((advise: Advise) => {
        if (!wsCurrent.current || !connected) {
            retryConnectionCallback()
            return
        }

        wsCurrent.current.send(JSON.stringify(advise))
    }, [wsCurrent, retryConnectionCallback, connected])

    const onSubmitAdvise = React.useCallback((ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault()
        setLoading(true)
        const calories = formAdvice.calories === 0 ? 'the recommended calories a person has to consume' : `${formAdvice.calories} calories`
        const weight = formAdvice.weight === 0 ? '' : `My actual weight is ${formAdvice.weight} kg`
        const question = ["i have the following food in my house:",
            formAdvice.ingredients,
            "I want to make a meal for the next three days with these ingredients.",
            "If I need more ingredients, please tell me so I can buy them in the supermarket.",
            `Each meal at the day cannot surpass ${calories}.`,
            "I don't want you to describe me the recipes, just tell me the name of them.",
            weight,
        ]
        try {
            sendQuestion({question: question.join(' ')})
        } catch (e) {
            console.error(e)
        }
    }, [formAdvice, sendQuestion, setLoading])

    return (
        <main>
            <div className={"grid grid-cols-2 p-2 gap-2"}>
                <div className={"grid gap-4"}>
                    <form onSubmit={onSubmitAdvise}>
                        <div className={"col-auto p-2"}>
                            <label htmlFor="nWeight" className={"mb-4 text-sm font-medium text-black"}>Weight
                                (Kg)</label>
                            <input type="number" id="nWeight" min="10" max="200"
                                   className={"block w-full p-1.5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"}
                                   onChange={(e) => setFormAdvice((old) => ({
                                       ...old,
                                       weight: parseInt(e.target.value)
                                   }))}
                                   required={true}/>
                        </div>

                        <div className={"col-auto p-2"}>
                            <label htmlFor="nCalories" className={"mb-4 text-sm font-medium text-black"}>Max calories in
                                a day</label>
                            <input type="number" id="nCalories" min="500" max="5000"
                                   className={"block w-full p-1.5 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"}
                                   onChange={(e) => setFormAdvice((old) => ({
                                       ...old,
                                       calories: parseInt(e.target.value)
                                   }))}
                                   required={true}/>
                        </div>

                        <div className={"col-auto p-2"}>
                            <label htmlFor="txtIngredients"
                                   className={"mb-4 text-sm font-medium text-black"}>Ingredients</label>
                            <textarea id="txtIngredients" cols={20} rows={5}
                                      onChange={(e) => setFormAdvice((old) => ({...old, ingredients: e.target.value}))}
                                      className={"resize-none block p-1.5 w-full text-sm text-black bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"}
                                      required={true}></textarea>
                        </div>

                        <div className={"col-auto p-2 place-items-center items-center"}>
                            <button type={"submit"}
                                    className={"text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}
                                    disabled={loading}
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>

                <div className={"grid gap-4 p-4"}>
                    <div className={"grid place-items-center"}>
                        <div id="respAdvise">Advice: {advise?.question ?? 'no response'}</div>
                    </div>
                </div>
            </div>
        </main>
    )
}
