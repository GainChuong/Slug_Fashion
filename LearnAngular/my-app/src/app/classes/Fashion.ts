export class Fashion{
    constructor(
        public _id:any=null,
        public IdF:number=0,
        public style:string="",
        public fashion_subject:string="",
        public fashion_detail:string="",
        public fashion_image:string="",
        public created_at:Date|string=new Date().toISOString()){}

    getBase64String(): string {
        if (this.fashion_image && this.fashion_image.startsWith("data:image/jpeg;base64,iVBORw0KGgo")) {
            return this.fashion_image.replace("data:image/jpeg;", "data:image/png;");
        }
        return this.fashion_image;
    }

    getSlug(): string {
        const sanitized = (this.fashion_subject || 'fashion')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        return `${sanitized}-p${this.IdF || 0}`;
    }
}
