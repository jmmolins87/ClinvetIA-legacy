"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default function NotFound(): React.JSX.Element {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* Background GIF - full screen without overlay */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/gifs/background-404.gif"
          alt=""
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h1 className="text-[7rem] font-bold leading-none tracking-tighter text-primary sm:text-[9rem] drop-shadow-lg">
          404
        </h1>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl drop-shadow-md">
          Página no encontrada
        </h2>
        <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base drop-shadow">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Icon name="House" className="mr-2 size-4" />
              Volver al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-white/90 hover:bg-white">
            <Link href="/contacto">
              <Icon name="MessageCircle" className="mr-2 size-4" />
              Contactar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
