import React from 'react';
import { Dialog, Transition } from '@headlessui/react';

import api from '../api';

export type SessionJoinProps = {
  isOpen: boolean;
  sessionId: number;
  onClose?: () => void;
  onSuccess?: () => void;
};

export default function SessionJoin(props: SessionJoinProps) {
  const { isOpen, sessionId, onSuccess, onClose = () => {} } = props;

  const [payload, setPayload] = React.useState({
    userName: '',
  });

  const onChange = React.useCallback(({ target }: React.ChangeEvent) => {
    if (target instanceof HTMLInputElement) {
      setPayload((prev) => ({
        ...prev,
        [target.name]: target.value,
      }));
    }
  }, []);

  const onSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const res = await api.post('/session/{id}/join', {
        payload,
        params: {
          id: sessionId,
        },
      });

      if (res.status === 200) {
        onSuccess?.();
      }
    },
    [payload],
  );

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              className="w-2/5 max-w-md"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="transform overflow-hidden rounded-2xl bg-slate-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-slate-200">
                  Join Session
                </Dialog.Title>

                <form onSubmit={onSubmit}>
                  <label
                    htmlFor="userName"
                    className="mt-4 block text-sm font-medium text-slate-100"
                  >
                    Your Name
                  </label>

                  <div className="mt-2">
                    <input
                      type="text"
                      name="userName"
                      id="userName"
                      className="block w-full rounded-md border-gray-300 shadow-sm px-5 py-3 placeholder-gray-500"
                      placeholder="e.g. Ada Lovelace"
                      onChange={onChange}
                    />
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      type="submit"
                      className="w-full rounded-md border border-transparent text-lg bg-blue-300 px-5 py-3 font-bold text-blue-900 hover:bg-blue-200"
                    >
                      Join
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
