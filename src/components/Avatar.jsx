import "./avatar.css";

export function Avatar({ src, alt = "avatar", size = 40 }) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="avatar"
      style={{ width: size, height: size }}
      onError={(e) => (e.target.src = "/default-avatar.png")}
    />
  );
}
