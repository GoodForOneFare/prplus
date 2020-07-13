import React, {ReactNode, createContext, useContext} from 'react';

export const TabsContext = createContext({isFilesView: false});
// export const FilesContext = createContext<{files: any[]}>({files: []});

export function useTabs() {
  return useContext(TabsContext);
}

function Consumer() {
  const context = useContext(TabsContext);
  return context;
}

// export function useFiles() {
//   return useContext(FilesContext);
// }

export interface FilesProps {
  name: string;
  children?: ReactNode;
}

export function Files({children}: any) {
  return (
    <TabsContext.Provider value={{isFilesView: false}}>
      {children}
    </TabsContext.Provider>
  );
}
