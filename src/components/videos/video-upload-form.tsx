"use client";

import { AuthInput } from "@/components/auth/auth-input";
import { FormSelect } from "@/components/ui/form-select";
import { OnboardingTextarea } from "@/components/onboarding/onboarding-textarea";
import { VIDEO_STAGE_OPTIONS } from "@/lib/videos/constants";
import type { VideoFormValues } from "@/lib/videos/types";
import type { ProductListItem } from "@/lib/products/types";

type VideoUploadFormProps = {
  values: VideoFormValues;
  products: ProductListItem[];
  durationLabel: string;
  onChange: (patch: Partial<VideoFormValues>) => void;
};

export function VideoUploadForm({
  values,
  products,
  durationLabel,
  onChange,
}: VideoUploadFormProps) {
  return (
    <div className="stack">
      <AuthInput
        id="video-title"
        label="Заглавие"
        value={values.title}
        onChange={(event) => onChange({ title: event.target.value })}
        placeholder="напр. Жътва на доматите"
        required
      />

      <FormSelect
        id="video-stage"
        label="Етап на сезона"
        value={values.stage}
        onChange={(event) =>
          onChange({ stage: event.target.value as VideoFormValues["stage"] })
        }
      >
        {VIDEO_STAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormSelect>

      <p className="text-sm text-stone-500">Продължителност: {durationLabel}</p>

      <OnboardingTextarea
        id="video-description"
        label="Описание (по избор)"
        value={values.description}
        onChange={(value) => onChange({ description: value })}
      />

      <FormSelect
        id="video-product"
        label="Свържи с продукт (по избор)"
        value={values.productId}
        onChange={(event) => onChange({ productId: event.target.value })}
      >
        <option value="">За цялата ферма (без продукт)</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.title}
          </option>
        ))}
      </FormSelect>
    </div>
  );
}
