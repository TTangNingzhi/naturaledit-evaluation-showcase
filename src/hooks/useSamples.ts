import { useEffect, useState } from "react";
import { parseJSONL } from "../utils";
import { DATASETS, TYPES } from "../constants";
import type { Sample } from "../types";

function getFileName(dataset: string, model: string, type: string) {
    if (dataset === "CanItEdit") {
        return `/data/${dataset}_${model}_${type}.jsonl`;
    } else if (dataset === "EditEval") {
        return `/data/${dataset}_${model}_instruction.jsonl`;
    }
    return "";
}

export function useSamples(initialDataset = "CanItEdit", initialModel = "gpt-4.1", initialType = "lazy") {
    const [samples, setSamples] = useState<Sample[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    const [dataset, setDatasetState] = useState(initialDataset);
    const [type, setTypeState] = useState(initialType);
    const [model, setModelState] = useState(initialModel);

    useEffect(() => {
        setLoading(true);
        fetch(getFileName(dataset, model, type))
            .then((res) => res.text())
            .then((text) => {
                setSamples(parseJSONL(text));
                setCurrent(0);
                setLoading(false);
            })
            .catch(() => {
                setSamples([]);
                setCurrent(0);
                setLoading(false);
            });
    }, [dataset, model, type]);

    function setDataset(ds: string) {
        setDatasetState(ds);
        // reset type to first option for CanItEdit
        if (ds === "CanItEdit") {
            setTypeState(TYPES[ds][0]);
        } else {
            // clear type for non-CanItEdit datasets
            setTypeState("");
        }
    }

    function setType(t: string) {
        setTypeState(t);
    }

    function setModel(m: string) {
        setModelState(m);
    }

    return {
        samples,
        current,
        setCurrent,
        loading,
        dataset,
        setDataset,
        type,
        setType,
        model,
        setModel,
        DATASETS,
        TYPES,
    };
}
