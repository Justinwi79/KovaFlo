export function Button({ className = "", ...props }) {
    return (
      <button
        className={
          "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 " +
          className
        }
        {...props}
      />
    );
  }
  