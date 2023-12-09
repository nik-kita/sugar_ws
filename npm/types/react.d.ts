import { type useEffect as react_useEffect, type useRef as react_useRef, type useState as react_useState } from "react";
export declare function genUseWs({ useEffect, useRef, useState, }: {
    useEffect: typeof react_useEffect;
    useRef: typeof react_useRef;
    useState: typeof react_useState;
}): (url: string) => {
    is_online: boolean;
    turn: import("react").Dispatch<import("react").SetStateAction<"on" | "off">>;
    send(message: string): void;
    on(label: keyof WebSocketEventMap, listener: ((ev: Event) => void) | ((ev: CloseEvent) => void) | ((ev: Event) => void) | ((ev: MessageEvent<any>) => void), options?: boolean | AddEventListenerOptions | undefined): string;
    once(label: keyof WebSocketEventMap, listener: ((ev: Event) => void) | ((ev: CloseEvent) => void) | ((ev: Event) => void) | ((ev: MessageEvent<any>) => void), options?: boolean | AddEventListenerOptions | undefined): string;
    rm(key: string): boolean;
};
