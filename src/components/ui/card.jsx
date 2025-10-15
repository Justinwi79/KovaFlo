export function Card({ className = "", ...props }) {
    return <div className={"rounded-2xl border bg-white shadow " + className} {...props} />;
  }
  
  export function CardContent({ className = "", ...props }) {
    return <div className={"p-6 " + className} {...props} />;
  }
  