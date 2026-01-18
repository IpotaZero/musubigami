export class Tasks {
    private static taskMap = new Map<string, Task>()

    /**
     * タスクを登録します。
     * 同じ名前のタスクが既に実行中の場合、古いタスクをキャンセルします。
     */
    static register(name: string): Task {
        // 1. 既存の同名タスクがあればキャンセルする
        this.cancel(name)

        // 2. 新しいタスクを作成して保存
        const task = { name, canceled: false }
        this.taskMap.set(name, task)

        return task
    }

    /**
     * 指定した名前のタスクをキャンセルし、管理対象から外します。
     */
    static cancel(name: string) {
        const existingTask = this.taskMap.get(name)
        if (existingTask) {
            existingTask.canceled = true
            this.taskMap.delete(name)
        }
    }

    /**
     * タスクが完了した際に呼び出して、メモリから削除します。
     */
    static complete(task: Task) {
        const current = this.taskMap.get(task.name)
        // 自分が最新のタスクである場合のみ削除（途中で上書きされていたら消さない）
        if (current === task) {
            this.taskMap.delete(task.name)
        }
    }
}

type Task = { readonly name: string; canceled: boolean }
