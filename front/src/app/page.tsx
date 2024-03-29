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
                            <label htmlFor="nWeight" className={"mb-4 text-xl font-medium text-black"}>Weight
                                (Kg)</label>
                            <input type="number" id="nWeight" min="10" max="200"
                                   className={"block w-full p-1.5 bg-gray-50 border border-gray-300 text-xl rounded-lg focus:ring-blue-500 focus:border-blue-500"}
                                   onChange={(e) => setFormAdvice((old) => ({
                                       ...old,
                                       weight: parseInt(e.target.value)
                                   }))}
                                   required={true}/>
                        </div>

                        <div className={"col-auto p-2"}>
                            <label htmlFor="nCalories" className={"mb-4 text-xl font-medium text-black"}>Max calories in
                                a day</label>
                            <input type="number" id="nCalories" min="500" max="5000"
                                   className={"block w-full p-1.5 bg-gray-50 border border-gray-300 text-xl rounded-lg focus:ring-blue-500 focus:border-blue-500"}
                                   onChange={(e) => setFormAdvice((old) => ({
                                       ...old,
                                       calories: parseInt(e.target.value)
                                   }))}
                                   required={true}/>
                        </div>

                        <div className={"col-auto p-2"}>
                            <label htmlFor="txtIngredients"
                                   className={"mb-4 text-xl font-medium text-black"}>Ingredients</label>
                            <textarea id="txtIngredients" cols={20} rows={5}
                                      onChange={(e) => setFormAdvice((old) => ({...old, ingredients: e.target.value}))}
                                      className={"resize-none block p-1.5 w-full text-xl text-black bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"}
                                      required={true}></textarea>
                        </div>

                        <div className={"justify-stretch gap-4 flex flex-row max-w-full place-items-center items-center"}>
                            <button type={"submit"}
                                    className={"text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xl text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"}
                                    disabled={loading}
                            >
                                Send
                            </button>
                            <div hidden={!loading}>
                                <svg aria-hidden="true"
                                     className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-red-600"
                                     viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"/>
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"/>
                                </svg>
                            </div>
                        </div>
                    </form>
                </div>

                <div className={"grid gap-4 p-4"}>
                    <div className={"grid place-items-center"}>
                        <div id="respAdvise" className={"text-xl"}>Advice: {advise?.question ?? 'no response'}</div>
                    </div>
                </div>
            </div>
        </main>
    )
}
